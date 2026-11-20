import { Fragment, useState } from 'react'
import { IconeSetaDir, IconeSetaEsq } from '@/components/CrudCard/icones'
import { Link } from 'react-router-dom'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useNegocio } from '@/hooks/useNegocio'
import { useGradeDaRotina } from '../rotina.hooks'
import { corDoPercentual, diaCurto, diaDaSemanaCurto, diaPorExtenso, estadoDaCelula, frequenciaDe, hojeEmBrasilia, somarDias } from '../rotina.utils'
import { tr } from '@/i18n'
import './rotina.css'

// Linhas agrupadas por bloco, na ordem em que chegam.
function agrupar(linhas) {
  const blocos = []
  linhas.forEach((linha) => {
    if (blocos.at(-1)?.id === linha.bloco) blocos.at(-1).linhas.push(linha)
    else blocos.push({ id: linha.bloco, linhas: [linha] })
  })
  return blocos
}

// Nome do bloco e da tarefa: os dos modelos prontos têm tradução; os criados pela pessoa aparecem como estão.
function tituloDaLinha(linha) {
  if (linha.tipo === 'tarefa') return `${linha.numero}. ${tr(linha.titulo)}`
  return `↳ ${tr(linha.titulo)}${linha.tipo === 'automatico' ? ` (${tr('automático')})` : ''}`
}

function Celula({ linha, dia, hoje, inicio, onMarcar }) {
  const estado = estadoDaCelula(linha, dia, hoje, inicio)
  const ehHoje = dia.dia === hoje
  if (estado === 'inativo') return <td className="rotina__cel" data-estado="inativo" data-hoje={ehHoje} aria-label={tr('Não precisa nesse dia')} />
  if (linha.tipo === 'automatico') {
    const sobra = dia.sobras?.[linha.contagem] ?? 0
    return (
      <td className="rotina__cel rotina__cel--numero" data-estado={estado} data-hoje={ehHoje}>
        {dia.contagens[linha.contagem]}
        {sobra > 0 && (
          <small className="rotina__sobra" title={tr('{n} que sobraram dos dias anteriores', { n: sobra })}>+{sobra}</small>
        )}
      </td>
    )
  }
  const feita = dia.feitas.includes(linha.id)
  return (
    <td className="rotina__cel" data-estado={estado} data-hoje={ehHoje}>
      <input type="checkbox" className="plan__caixa" checked={feita} disabled={!!linha.auto}
        title={linha.auto ? (dia.sobras?.[linha.auto] ? tr('Marcada sozinha pelo sistema. Sobra dos dias anteriores: {n}', { n: dia.sobras[linha.auto] }) : tr('Marcada sozinha pelo sistema')) : undefined}
        onChange={(e) => onMarcar(dia, linha.id, e.target.checked)}
        aria-label={`${tr(linha.titulo)} · ${diaPorExtenso(dia.dia)}`} />
    </td>
  )
}

export default function RotinaDiaria() {
  const { hasRole } = useAuthContext()
  const { negocio } = useNegocio()
  const podeEditar = hasRole('admin') || hasRole('super_admin')
  const hoje = hojeEmBrasilia()
  // A grade começa sempre em hoje e anda sozinha a cada dia; as setas voltam ou avançam uma semana.
  const [de, setDe] = useState(hoje)
  const { grade, erro, marcar } = useGradeDaRotina(de)
  const emHoje = de === hoje

  return (
    <div className="page page--planilha">
      <header className="plan-titulo">
        <div>
          <h2>{tr('Rotina diária')}{negocio ? ` — ${negocio.nome}` : ''}</h2>
          <p>{tr('Marque a caixinha quando fizer. Cinza = não precisa nesse dia. Linhas "Opcional" = canais que você usou (não contam no %). Dia ruim? Faça o mínimo: 10 contatos + 3 follow-ups.')}</p>
        </div>
        <div className="plan-titulo__acoes">
          {podeEditar && <Link className="btn btn--sm" to="/rotina/editar">{tr('Editar rotina')}</Link>}
          <button type="button" className="icon-btn" aria-label={tr('Semana anterior')} title={tr('Semana anterior')} onClick={() => setDe(somarDias(de, -7))}>
            <IconeSetaEsq />
          </button>
          <button type="button" className="btn btn--sm" disabled={emHoje} onClick={() => setDe(hoje)}>{tr('Hoje')}</button>
          <button type="button" className="icon-btn" aria-label={tr('Próxima semana')} title={tr('Próxima semana')} onClick={() => setDe(somarDias(de, 7))}>
            <IconeSetaDir />
          </button>
        </div>
      </header>

      {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}

      {grade && grade.linhas.length === 0 && (
        <EstadoVazio icone={ICONES.rotina} titulo={tr('A rotina deste negócio está vazia')} texto={tr('Monte os blocos e as tarefas do dia, ou comece de um modelo pronto.')}
          acao={podeEditar && <Link className="btn btn--primary" to="/rotina/editar">{tr('Montar a rotina')}</Link>} />
      )}

      {!grade ? (
        <div className="plan-wrap plan-carregando" aria-busy="true" aria-label={tr('Carregando')}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="skeleton skeleton--line" style={{ height: 30 }} />)}
        </div>
      ) : grade.linhas.length > 0 && (
        <div className="plan-wrap">
          <table className="plan rotina">
            <thead>
              <tr>
                <th rowSpan={2} className="rotina__bloco">{tr('Bloco')}</th>
                <th rowSpan={2} className="rotina__tarefa">{tr('Tarefa')}</th>
                <th rowSpan={2} className="rotina__meta">{tr('Meta')}</th>
                <th rowSpan={2} className="rotina__freq">{tr('Frequência')}</th>
                {grade.dias.map((dia) => (
                  <th key={dia.dia} className="rotina__dia" data-hoje={dia.dia === grade.hoje}>
                    {diaCurto(dia.dia)}
                  </th>
                ))}
              </tr>
              <tr>
                {grade.dias.map((dia) => (
                  <th key={dia.dia} className="rotina__dia rotina__dia--semana" data-hoje={dia.dia === grade.hoje}>{diaDaSemanaCurto(dia.dia)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agrupar(grade.linhas).map(({ id, linhas }) => ({ ...(grade.blocos.find((bloco) => bloco.id === id) ?? { id, nome: id, cor: '#64748b' }), linhas })).map((bloco) => (
                <Fragment key={bloco.id}>
                  <tr className="rotina__bloco-linha" style={{ '--bloco-cor': bloco.cor }}>
                    <th colSpan={3 + grade.dias.length}><span>{tr(bloco.nome)}</span></th>
                  </tr>
                  {bloco.linhas.map((linha, i) => (
                    <tr key={linha.id} className={`rotina__linha rotina__linha--${linha.tipo}`} style={{ '--bloco-cor': bloco.cor }}>
                      {i === 0 && <th rowSpan={bloco.linhas.length} scope="rowgroup" className="rotina__bloco">{tr(bloco.nome)}</th>}
                      <th scope="row" className="rotina__tarefa">
                        {tituloDaLinha(linha)}
                        {linha.meta ? <small className="rotina__meta-celular">{tr('Meta: {n}', { n: linha.meta })}</small> : null}
                      </th>
                      <td className="rotina__meta">{linha.meta ?? ''}</td>
                      <td className="rotina__freq">{frequenciaDe(linha)}</td>
                      {grade.dias.map((dia) => <Celula key={dia.dia} linha={linha} dia={dia} hoje={grade.hoje} inicio={grade.inicio} onMarcar={marcar} />)}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="rotina__total">
                <th className="rotina__bloco" />
                <th scope="row" className="rotina__tarefa">{tr('% do dia concluído')}</th>
                <td className="rotina__meta" />
                <td className="rotina__freq" />
                {grade.dias.map((dia) => (
                  <td key={dia.dia} className="rotina__cel rotina__cel--numero" style={{ background: corDoPercentual(dia.percentual) }}>{dia.percentual}%</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
