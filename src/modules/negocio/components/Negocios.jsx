import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { IconeLapis, IconeMais } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useAuthContext } from '@/hooks/useAuthContext'
import { iniciais } from '@/utils/nome'
import { useNegocios } from '../negocio.hooks'
import NegocioModal from './NegocioModal'
import ModeloModal from './ModeloModal'
import { tr } from '@/i18n'
import './negocios.css'

function CartaoDoNegocio({ negocio, aberto, podeMudar, entrando, onEntrar, onEditar, onExcluir }) {
  return (
    <article className="card negocio" data-aberto={aberto}>
      <div className="negocio__topo">
        <span className="negocio__avatar" aria-hidden="true">{iniciais(negocio.nome)}</span>
        <div className="negocio__nome">
          <strong>{negocio.nome}</strong>
          {negocio.site && <small>{negocio.site}</small>}
        </div>
        {aberto && <span className="badge badge--success">{tr('Aberto agora')}</span>}
      </div>
      {negocio.modelo && <p className="negocio__modelo">{tr('Começou com o modelo: {nome}', { nome: tr(negocio.modelo) })}</p>}
      <div className="negocio__acoes">
        {aberto ? (
          <Link className="btn btn--sm btn--ghost" to="/home">{tr('Ir para a rotina')}</Link>
        ) : (
          <button type="button" className={`btn btn--sm btn--primary${entrando ? ' btn--loading' : ''}`} disabled={entrando} onClick={onEntrar}>
            {entrando ? tr('Entrando...') : tr('Entrar')}
          </button>
        )}
        {podeMudar && (
          <span className="negocio__icones">
            <button type="button" className="icon-btn" aria-label={tr('Editar {nome}', { nome: negocio.nome })} title={tr('Editar')} onClick={onEditar}>
              <IconeLapis />
            </button>
            {!aberto && <ConfirmarNoLugar rotulo={tr('Excluir {nome}', { nome: negocio.nome })} pergunta={tr('Excluir com todos os dados?')} onConfirmar={onExcluir} />}
          </span>
        )}
      </div>
    </article>
  )
}

export default function Negocios() {
  const { hasRole } = useAuthContext()
  const podeMudar = hasRole('admin') || hasRole('super_admin')
  const { negocios, ativo, modelos, erro, sucesso, entrando, limparAvisos, criar, editar, excluir, salvarModelo, excluirModelo, entrar } = useNegocios()
  const [modal, setModal] = useState(null)
  const negocioAberto = negocios?.find((negocio) => negocio._id === ativo)

  function abrir(tipo, negocio = null) {
    limparAvisos()
    setModal({ tipo, negocio })
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{tr('Negócios')} {negocios && <span className="badge badge--primary">{negocios.length}</span>}</h2>
          <p className="page-subtitle">{tr('Cada negócio tem a própria rotina, leads, parceiros e painel. Entre no que for trabalhar agora.')}</p>
        </div>
        {podeMudar && (
          <div className="page-header__acoes">
            <button type="button" className="btn btn--primary" onClick={() => abrir('negocio')}><IconeMais /> {tr('Novo negócio')}</button>
          </div>
        )}
      </header>

      {!modal && (erro || sucesso) && (
        <div className="alerts">
          {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
          {sucesso && <p className="alert alert--success" role="status">{tr(sucesso)}</p>}
        </div>
      )}

      {!negocios ? (
        <div className="negocios" aria-busy="true" aria-label={tr('Carregando')}>
          {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 18 }} />)}
        </div>
      ) : (
        <div className="negocios stagger">
          {negocios.map((negocio, i) => (
            <div key={negocio._id} style={{ '--i': i }}>
              <CartaoDoNegocio negocio={negocio} aberto={negocio._id === ativo} podeMudar={podeMudar} entrando={entrando === negocio._id}
                onEntrar={() => entrar(negocio._id)} onEditar={() => abrir('negocio', negocio)} onExcluir={() => excluir(negocio._id)} />
            </div>
          ))}
        </div>
      )}

      <section className="card modelos">
        <div className="modelos__topo">
          <div>
            <h3 className="form-card__title">{tr('Modelos de rotina')}</h3>
            <p className="modelos__texto">{tr('Os prontos servem de ponto de partida. Ajustou a rotina de um negócio? Salve como modelo e use nos próximos.')}</p>
          </div>
          {podeMudar && negocioAberto && (
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => abrir('modelo')}>{tr('Salvar o negócio aberto como modelo')}</button>
          )}
        </div>
        {!modelos ? (
          <div className="skeleton skeleton--line" style={{ height: 60 }} />
        ) : modelos.length === 0 ? (
          <EstadoVazio icone={ICONES.rotina} titulo={tr('Nenhum modelo')} />
        ) : (
          <ul className="modelos__lista">
            {modelos.map((modelo) => (
              <li key={modelo.id} className="modelos__item">
                <div>
                  <strong>{tr(modelo.nome)}</strong> <span className={`badge${modelo.proprio ? ' badge--primary' : ''}`}>{modelo.proprio ? tr('Seu') : tr('Pronto')}</span>
                  {modelo.descricao && <p>{tr(modelo.descricao)}</p>}
                  <small>{tr('{blocos} blocos · {tarefas} tarefas', { blocos: modelo.blocos, tarefas: modelo.tarefas })}</small>
                </div>
                {modelo.proprio && podeMudar && <ConfirmarNoLugar rotulo={tr('Excluir modelo')} onConfirmar={() => excluirModelo(modelo.id)} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal?.tipo === 'negocio' && (
        <NegocioModal negocio={modal.negocio} modelos={modelos} erro={erro}
          onSalvar={(campos) => (modal.negocio ? editar(modal.negocio._id, campos) : criar(campos))} onClose={() => setModal(null)} />
      )}
      {modal?.tipo === 'modelo' && (
        <ModeloModal nomeDoNegocio={negocioAberto?.nome} erro={erro} onSalvar={salvarModelo} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
