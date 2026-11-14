import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import TelaDePlanilha from '@/components/Planilha/TelaDePlanilha'
import { IconeLapis, IconeMais } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useNegocio } from '@/hooks/useNegocio'
import { useEditarRotina } from '@/modules/negocio/negocio.hooks'
import { TIPOS_DE_LINHA, descricaoDoAuto, frequenciaDe, linhasNaOrdemDosBlocos, mover } from '../rotina.utils'
import BlocoModal from './BlocoModal'
import TarefaModal from './TarefaModal'
import UsarModeloModal from './UsarModeloModal'
import { tr } from '@/i18n'
import './rotina-editar.css'

const IconeSobe = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6" /></svg>
const IconeDesce = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>

function Mover({ rotulo, indice, total, onMover }) {
  return (
    <>
      <button type="button" className="icon-btn" aria-label={tr('Subir {nome}', { nome: rotulo })} title={tr('Subir')} disabled={indice === 0} onClick={() => onMover(-1)}><IconeSobe /></button>
      <button type="button" className="icon-btn" aria-label={tr('Descer {nome}', { nome: rotulo })} title={tr('Descer')} disabled={indice === total - 1} onClick={() => onMover(1)}><IconeDesce /></button>
    </>
  )
}

// Montar a rotina do negócio aberto: blocos (com cor) e as tarefas de cada um. Cada mudança é salva na hora.
export default function EditarRotina() {
  const { negocio } = useNegocio()
  const { rotina, modelos, erro, sucesso, salvar, aplicar } = useEditarRotina()
  const [modal, setModal] = useState(null)

  const blocos = rotina?.blocos ?? []
  const linhas = rotina?.linhas ?? []
  const guardar = (novosBlocos, novasLinhas) => salvar({ blocos: novosBlocos, linhas: linhasNaOrdemDosBlocos(novosBlocos, novasLinhas) })

  const salvarBloco = (dados) => (modal.bloco
    ? guardar(blocos.map((bloco) => (bloco.id === modal.bloco.id ? { ...bloco, ...dados } : bloco)), linhas)
    : guardar([...blocos, dados], linhas))
  const salvarTarefa = (dados) => (modal.linha
    ? guardar(blocos, linhas.map((linha) => (linha.id === modal.linha.id ? { ...linha, ...dados } : linha)))
    : guardar(blocos, [...linhas, dados]))
  const moverBloco = (indice, delta) => guardar(mover(blocos, indice, delta), linhas)
  const excluirBloco = (id) => guardar(blocos.filter((bloco) => bloco.id !== id), linhas.filter((linha) => linha.bloco !== id))
  const excluirTarefa = (id) => guardar(blocos, linhas.filter((linha) => linha.id !== id))
  function moverTarefa(linha, delta) {
    const doBloco = linhas.filter((item) => item.bloco === linha.bloco)
    const movidas = mover(doBloco, doBloco.indexOf(linha), delta)
    guardar(blocos, [...linhas.filter((item) => item.bloco !== linha.bloco), ...movidas])
  }

  return (
    <TelaDePlanilha titulo={`${tr('Editar rotina')}${negocio ? ` — ${negocio.nome}` : ''}`} carregando={!rotina}
      erro={!modal && erro} subtitulo={tr('Crie blocos e tarefas do seu jeito, ou comece de um modelo pronto. Tudo é salvo na hora.')}
      acoes={(
        <>
          <Link className="btn btn--sm" to="/home">{tr('Voltar para a rotina')}</Link>
          <button type="button" className="btn btn--sm" onClick={() => setModal({ tipo: 'modelo' })}>{tr('Usar um modelo')}</button>
          <button type="button" className="btn btn--sm btn--primary" onClick={() => setModal({ tipo: 'bloco' })}><IconeMais /> {tr('Novo bloco')}</button>
        </>
      )}>
      {!modal && sucesso && <p className="alert alert--success" role="status">{tr(sucesso)}</p>}

      {blocos.length === 0 ? (
        <section className="card editar-vazio">
          <EstadoVazio icone={ICONES.rotina} titulo={tr('Nenhum bloco ainda')} texto={tr('Um bloco junta tarefas parecidas (ex.: Leads, Vídeo, Fechamento).')}
            acao={<button type="button" className="btn btn--primary" onClick={() => setModal({ tipo: 'bloco' })}>{tr('Criar o primeiro bloco')}</button>} />
        </section>
      ) : (
        <div className="editar-blocos">
          {blocos.map((bloco, indice) => {
            const doBloco = linhas.filter((linha) => linha.bloco === bloco.id)
            return (
              <section key={bloco.id} className="plan-wrap editar-bloco" style={{ '--bloco-cor': bloco.cor }}>
                <header className="editar-bloco__topo">
                  <h3>{tr(bloco.nome)} <small>{doBloco.length === 1 ? tr('1 linha') : tr('{n} linhas', { n: doBloco.length })}</small></h3>
                  <div className="editar-bloco__acoes">
                    <button type="button" className="btn btn--sm" onClick={() => setModal({ tipo: 'tarefa', bloco: bloco.id })}><IconeMais /> {tr('Nova tarefa')}</button>
                    <Mover rotulo={tr(bloco.nome)} indice={indice} total={blocos.length} onMover={(delta) => moverBloco(indice, delta)} />
                    <button type="button" className="icon-btn" aria-label={tr('Editar {nome}', { nome: tr(bloco.nome) })} title={tr('Editar')} onClick={() => setModal({ tipo: 'bloco', bloco })}><IconeLapis /></button>
                    <ConfirmarNoLugar rotulo={tr('Excluir {nome}', { nome: tr(bloco.nome) })} pergunta={doBloco.length ? tr('Excluir com as tarefas?') : tr('Excluir?')} onConfirmar={() => excluirBloco(bloco.id)} />
                  </div>
                </header>
                {doBloco.length > 0 && (
                  <table className="plan editar-tabela">
                    <thead>
                      <tr>
                        <th>{tr('Tarefa')}</th>
                        <th className="editar-tabela__curta">{tr('Tipo')}</th>
                        <th className="editar-tabela__curta">{tr('Meta')}</th>
                        <th className="editar-tabela__curta">{tr('Frequência')}</th>
                        <th className="editar-tabela__auto">{tr('Marca sozinha / conta')}</th>
                        <th aria-label={tr('Ações')} />
                      </tr>
                    </thead>
                    <tbody>
                      {doBloco.map((linha, posicao) => (
                        <tr key={linha.id} className={`editar-tabela__linha--${linha.tipo}`}>
                          <td>{linha.tipo === 'tarefa' ? tr(linha.titulo) : `↳ ${tr(linha.titulo)}`}</td>
                          <td className="editar-tabela__curta">{TIPOS_DE_LINHA.find((tipo) => tipo.valor === linha.tipo)?.rotulo}</td>
                          <td className="editar-tabela__curta">{linha.meta ?? ''}</td>
                          <td className="editar-tabela__curta">{frequenciaDe({ ...linha, tipo: 'tarefa' })}</td>
                          <td className="editar-tabela__auto">{descricaoDoAuto(linha)}</td>
                          <td className="plan__acoes">
                            <div className="table__actions">
                              <Mover rotulo={tr(linha.titulo)} indice={posicao} total={doBloco.length} onMover={(delta) => moverTarefa(linha, delta)} />
                              <button type="button" className="icon-btn" aria-label={tr('Editar {nome}', { nome: tr(linha.titulo) })} title={tr('Editar')} onClick={() => setModal({ tipo: 'tarefa', linha })}><IconeLapis /></button>
                              <ConfirmarNoLugar rotulo={tr('Excluir {nome}', { nome: tr(linha.titulo) })} onConfirmar={() => excluirTarefa(linha.id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            )
          })}
        </div>
      )}

      {modal?.tipo === 'bloco' && <BlocoModal bloco={modal.bloco} erro={erro} onSalvar={salvarBloco} onClose={() => setModal(null)} />}
      {modal?.tipo === 'tarefa' && (
        <TarefaModal linha={modal.linha} blocos={blocos} blocoInicial={modal.bloco} erro={erro} onSalvar={salvarTarefa} onClose={() => setModal(null)} />
      )}
      {modal?.tipo === 'modelo' && <UsarModeloModal modelos={modelos} erro={erro} onUsar={aplicar} onClose={() => setModal(null)} />}
    </TelaDePlanilha>
  )
}
