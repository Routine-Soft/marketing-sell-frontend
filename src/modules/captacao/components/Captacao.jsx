import { useState } from 'react'
import { Link } from 'react-router-dom'
import FiltrosDaFonte from './FiltrosDaFonte'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { Icone } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useCaptacao } from '../captacao.hooks'
import { FILTROS_INICIAIS, FONTES, formatarDataHora, resumoDosFiltros } from '../captacao.utils'
import { localeAtual, tr } from '@/i18n'
import './captacao.css'

const ICONES_FONTE = {
  npi: (<><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z" /></>),
  google: (<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>),
  empresas_novas: (<><path d="M12 3v3M18.4 5.6l-2.1 2.1M21 12h-3M5.6 5.6l2.1 2.1M3 12h3" /><path d="M5 21h14M7 21v-6a5 5 0 0 1 10 0v6" /></>),
  licencas: (<><rect width="18" height="14" x="3" y="5" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.7-1.4 1.8-2 3-2s2.3.6 3 2M15 10h3M15 14h2" /></>),
}

function CotaGoogle({ cota }) {
  const porcentagem = cota.limite ? Math.min(100, Math.round((cota.usado / cota.limite) * 100)) : 100
  return (
    <div className="cota-google" data-cheia={cota.restante === 0}>
      <div className="cota-google__texto">
        <span>{tr('Cota do Google neste mês')}</span>
        <strong>{tr('{usado} de {limite} páginas', { usado: cota.usado, limite: cota.limite })}</strong>
      </div>
      <div className="cota-google__barra" role="progressbar" aria-valuemin={0} aria-valuemax={cota.limite} aria-valuenow={cota.usado}
        aria-label={tr('Cota do Google neste mês')}>
        <span style={{ width: `${porcentagem}%` }} />
      </div>
    </div>
  )
}

export default function Captacao() {
  const { opcoes, historico, carregando, erroCarregar, buscando, erro, resultado, buscar } = useCaptacao()
  const [fonte, setFonte] = useState(null)
  const [filtros, setFiltros] = useState({})
  const [buscarEmails, setBuscarEmails] = useState(true)

  function escolherFonte(id) {
    setFonte(id)
    setFiltros(FILTROS_INICIAIS[id])
  }

  function mudar(campo, valor) {
    setFiltros((atual) => ({ ...atual, [campo]: valor, ...(campo === 'estado' && fonte === 'licencas' ? { tipo: '' } : {}) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    buscar(fonte, filtros, fonte === 'google' && buscarEmails)
  }

  const googleIndisponivel = opcoes && (!opcoes.googleConfigurado || opcoes.cotaGoogle.restante === 0)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{tr('Captação')}</h2>
          <p className="page-subtitle">{tr('Escolha uma fonte, filtre e traga empresas para a sua lista de leads')}</p>
        </div>
      </header>

      {erroCarregar && <div className="alerts"><p className="alert alert--error" role="alert">{erroCarregar.message}</p></div>}

      {carregando ? (
        <div className="fontes" aria-busy="true" aria-label={tr('Carregando')}>
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton fonte-skeleton" />)}
        </div>
      ) : opcoes && (
        <>
          <div className="fontes stagger" role="radiogroup" aria-label={tr('Fonte de dados')}>
            {opcoes.fontes.map(({ id }) => (
              <button key={id} type="button" role="radio" aria-checked={fonte === id} className="fonte card" onClick={() => escolherFonte(id)}>
                <span className="fonte__icone" aria-hidden="true"><Icone>{ICONES_FONTE[id]}</Icone></span>
                <strong className="fonte__nome">{FONTES[id]?.nome ?? id}</strong>
                <span className="fonte__descricao">{FONTES[id]?.descricao}</span>
                <span className="fonte__traz">
                  {FONTES[id]?.traz.map((item) => <span key={item} className="badge">{item}</span>)}
                </span>
                {id === 'google' && <CotaGoogle cota={opcoes.cotaGoogle} />}
              </button>
            ))}
          </div>

          {fonte && (
            <form key={fonte} className="card form-card captacao-form" onSubmit={handleSubmit}>
              <h3 className="form-card__title">{FONTES[fonte]?.nome}</h3>

              {fonte === 'google' && !opcoes.googleConfigurado && (
                <p className="alert alert--warning">{tr('A busca no Google ainda não foi configurada no servidor (falta a chave da API).')}</p>
              )}
              {fonte === 'google' && opcoes.googleConfigurado && opcoes.cotaGoogle.restante === 0 && (
                <p className="alert alert--warning">{tr('A cota de buscas no Google deste mês acabou. Fale com o suporte para aumentar.')}</p>
              )}

              <div className="form-grid captacao-form__campos">
                <FiltrosDaFonte fonte={fonte} filtros={filtros} mudar={mudar} opcoes={opcoes} />
              </div>

              {fonte === 'google' && (
                <label className="check captacao-form__emails">
                  <input type="checkbox" checked={buscarEmails} onChange={(e) => setBuscarEmails(e.target.checked)} />
                  {tr('Procurar o e-mail no site de cada empresa (em segundo plano)')}
                </label>
              )}

              {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}

              <div className="form-actions">
                <button type="submit" className={`btn btn--primary${buscando ? ' btn--loading' : ''}`}
                  disabled={buscando || (fonte === 'google' && googleIndisponivel)}>
                  {buscando ? tr('Buscando...') : tr('Buscar')}
                </button>
              </div>
            </form>
          )}

          {resultado && (
            <div className="alert alert--success captacao-resultado" role="status">
              <span>
                {resultado.message}
                {resultado.emailsNaFila > 0 && ` · ${tr('{n} sites na fila para procurar e-mail', { n: resultado.emailsNaFila })}`}
              </span>
              {resultado.busca.encontrados > 0 && (
                <Link className="btn btn--sm btn--ghost" to={`/leads?buscaId=${resultado.busca._id}`}>{tr('Ver os leads desta busca')}</Link>
              )}
            </div>
          )}

          <section className="card captacao-historico">
            <h3 className="form-card__title">{tr('Últimas buscas')}</h3>
            {historico.length === 0 ? (
              <EstadoVazio icone={ICONES.captacao} titulo={tr('Nenhuma busca ainda')} texto={tr('Escolha uma fonte acima para fazer a primeira.')} />
            ) : (
              <ul className="historico stagger">
                {historico.map((b) => (
                  <li key={b._id} className="historico__item">
                    <span className="historico__icone" aria-hidden="true"><Icone>{ICONES_FONTE[b.fonte]}</Icone></span>
                    <span className="historico__textos">
                      <strong>{FONTES[b.fonte]?.nome ?? b.fonte}</strong>
                      <span>{resumoDosFiltros(b)}</span>
                      <small>{formatarDataHora(b.createdAt)}</small>
                    </span>
                    <span className="historico__numeros">
                      <span className="badge badge--primary">
                        {tr('{n} novos', { n: b.novos.toLocaleString(localeAtual()) })}
                      </span>
                      <small>{tr('{n} encontrados', { n: b.encontrados.toLocaleString(localeAtual()) })}</small>
                    </span>
                    {b.encontrados > 0 && (
                      <Link className="link historico__link" to={`/leads?buscaId=${b._id}`}>{tr('Ver leads')}</Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
