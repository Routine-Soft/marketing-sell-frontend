import { useState } from 'react'
import RemetenteModal from './RemetenteModal'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import { IconeLapis, IconeMais } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useCotasGmail, useRemetentes } from '../remetente.hooks'
import { tr } from '@/i18n'
import './remetente.css'

function CotasGmail({ cotas, onCancelarFila }) {
  if (cotas.length === 0) return null

  return (
    <section className="card cotas-gmail">
      <h3 className="cotas-gmail__titulo">{tr('Envios de hoje')}</h3>
      <div className="cotas-gmail__lista stagger">
        {cotas.map((c) => {
          const porcentagem = c.limite ? Math.min(100, Math.round((c.usado / c.limite) * 100)) : 100
          return (
            <div key={c.email} className="cota-gmail" data-cheia={c.restante === 0}>
              <div className="cota-gmail__texto">
                <span>{c.email}</span>
                <strong>{tr('{usado} de {limite} e-mails', { usado: c.usado, limite: c.limite })}</strong>
              </div>
              <div
                className="cota-gmail__barra"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={c.limite}
                aria-valuenow={c.usado}
                aria-label={tr('E-mails enviados hoje por {email}', { email: c.email })}
              >
                <span style={{ width: `${porcentagem}%` }} />
              </div>
              {c.naFila > 0 && (
                <div className="cota-gmail__fila">
                  <span className="badge badge--info badge--live">{tr('{n} na fila', { n: c.naFila })}</span>
                  <ConfirmarNoLugar rotulo={tr('Cancelar o que está na fila')} pergunta={tr('Cancelar a fila?')} onConfirmar={() => onCancelarFila(c.email)} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function Remetentes() {
  const { remetentes, carregando, erro, sucesso, criar, editar, excluir, testar, cancelarFila } = useRemetentes()
  const { cotas, recarregar: recarregarCotas } = useCotasGmail()
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [testando, setTestando] = useState(null)

  async function handleTestar(id) {
    setTestando(id)
    await testar(id)
    setTestando(null)
    recarregarCotas()
  }

  function abrirEdicao(remetente) {
    setEditando(remetente)
    setModalAberto(true)
  }

  function abrirCriacao() {
    setEditando(null)
    setModalAberto(true)
  }

  async function excluirRemetente(id) {
    await excluir(id)
    recarregarCotas()
  }

  async function salvar(dados) {
    const salvo = editando ? await editar(editando._id, dados) : await criar(dados)
    if (salvo) recarregarCotas()
    return salvo
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{tr('Remetentes')}</h2>
          <p className="page-subtitle">{tr('Um remetente por negócio, cada um com seu e-mail, assunto e corpo padrão')}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={abrirCriacao}>
          <IconeMais /> {tr('Novo remetente')}
        </button>
      </header>

      <CotasGmail cotas={cotas} onCancelarFila={async (email) => { await cancelarFila(email); recarregarCotas() }} />

      {(sucesso || erro) && (
        <div className="alerts">
          {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
          {sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}
        </div>
      )}

      {carregando ? (
        <div className="remetentes" aria-busy="true" aria-label={tr('Carregando')}>
          {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 190, borderRadius: 16 }} />)}
        </div>
      ) : remetentes.length === 0 ? (
        <EstadoVazio
          icone={ICONES.email}
          titulo={tr('Nenhum remetente ainda')}
          texto={tr('Crie um remetente para cada negócio, com o Gmail, o assunto e o corpo do e-mail.')}
          acao={<button type="button" className="btn btn--primary" onClick={abrirCriacao}>{tr('Novo remetente')}</button>}
        />
      ) : (
        <div className="remetentes stagger">
          {remetentes.map((r) => (
            <article key={r._id} className="card remetente-card">
              <header className="remetente-card__topo">
                <div>
                  <strong>{r.nomeExibicao}</strong>
                  {r.nomeNegocio !== r.nomeExibicao && <small>{r.nomeNegocio}</small>}
                </div>
                <span className={`badge ${r.ativo ? 'badge--success' : 'badge--warning'}`}>
                  {r.ativo ? tr('Ativo') : tr('Inativo')}
                </span>
              </header>

              <p className="remetente-card__email">{r.email}</p>
              {r.assuntoPadrao && <p className="remetente-card__assunto">{tr('Assunto')}: {r.assuntoPadrao}</p>}

              <div className="remetente-card__acoes">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={testando === r._id}
                  onClick={() => handleTestar(r._id)}
                >
                  {testando === r._id ? tr('Enviando...') : tr('Enviar teste')}
                </button>
                <div className="table__actions">
                  <button type="button" className="icon-btn" aria-label={tr('Editar')} title={tr('Editar')} onClick={() => abrirEdicao(r)}>
                    <IconeLapis />
                  </button>
                  <ConfirmarNoLugar rotulo={tr('Excluir remetente')} onConfirmar={() => excluirRemetente(r._id)} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalAberto && (
        <RemetenteModal remetente={editando} erro={erro} onSave={salvar} onClose={() => setModalAberto(false)} />
      )}
    </div>
  )
}
