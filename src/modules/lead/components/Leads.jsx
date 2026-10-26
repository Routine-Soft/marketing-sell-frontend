import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LeadModal from './LeadModal'
import EnviarEmailModal from '@/modules/envio/components/EnviarEmailModal'
import { useAuthContext } from '@/hooks/useAuthContext'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import { Icone, IconeBusca, IconeLapis, IconeSetaDir, IconeSetaEsq, IconeX } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useLeads } from '../lead.hooks'
import { FILTROS_VAZIOS, ROTULO_EMAIL, ROTULO_FONTE, STATUS, emBuscaDeEmail, linkDoSite, siteSemProtocolo } from '../lead.utils'
import { formatarData } from '@/modules/captacao/captacao.utils'
import { localeAtual, tr } from '@/i18n'
import './leads.css'

function SituacaoDoEnvio({ lead }) {
  if (lead.envioPendente) return <span className="badge badge--info badge--live">{tr('Na fila de envio')}</span>
  if (lead.envioErro) return <span className="badge badge--danger" title={tr(lead.envioErro)}>{tr('Falha no envio')}</span>
  if (!lead.ultimoEnvioEm) return null
  return (
    <small className="leads__enviado">
      {tr('E-mail enviado em {data} · {negocio}', { data: formatarData(lead.ultimoEnvioEm), negocio: lead.ultimoEnvioNegocio })}
    </small>
  )
}

function CelulaEmail({ lead }) {
  if (lead.email) {
    return (
      <>
        <a className="link leads__email" href={`mailto:${lead.email}`}>{lead.email}</a>
        <SituacaoDoEnvio lead={lead} />
      </>
    )
  }
  return (
    <span className={`badge${emBuscaDeEmail(lead) ? ' badge--info badge--live' : ''}`}>{ROTULO_EMAIL[lead.emailStatus] ?? lead.emailStatus}</span>
  )
}

export default function Leads() {
  const [params, setParams] = useSearchParams()
  const filtros = useMemo(() => {
    const lidos = { ...FILTROS_VAZIOS }
    Object.keys(lidos).forEach((chave) => { lidos[chave] = params.get(chave) ?? '' })
    return lidos
  }, [params])
  const pagina = Math.max(1, Number(params.get('pagina')) || 1)

  const { itens, total, porPagina, carregando, erro, sucesso, exportando, salvar, excluir, excluirVarios, procurarEmails, exportar, depoisDoEnvio } = useLeads(filtros, pagina)
  const { hasRole } = useAuthContext()
  const podeEnviar = hasRole('admin') || hasRole('super_admin')
  const [enviarPara, setEnviarPara] = useState(null)
  const [texto, setTexto] = useState(filtros.busca)
  const [selecionados, setSelecionados] = useState(() => new Set())
  const [aberto, setAberto] = useState(null)

  function mudarFiltro(campo, valor) {
    setParams((atual) => {
      const novo = new URLSearchParams(atual)
      if (valor) novo.set(campo, valor)
      else novo.delete(campo)
      novo.delete('pagina')
      return novo
    })
  }

  function irParaPagina(numero) {
    setParams((atual) => {
      const novo = new URLSearchParams(atual)
      novo.set('pagina', numero)
      return novo
    })
  }

  // Busca enquanto digita, com uma pausa curta para não pedir a cada letra.
  useEffect(() => {
    if (texto === filtros.busca) return undefined
    const timer = setTimeout(() => mudarFiltro('busca', texto.trim()), 400)
    return () => clearTimeout(timer)
  })

  const idsVisiveis = itens.map((l) => l._id)
  const escolhidos = idsVisiveis.filter((id) => selecionados.has(id))
  const todosMarcados = idsVisiveis.length > 0 && escolhidos.length === idsVisiveis.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  const temFiltro = Object.values(filtros).some(Boolean)

  function alternar(id) {
    setSelecionados((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  function alternarTodos() {
    setSelecionados(todosMarcados ? new Set() : new Set(idsVisiveis))
  }

  function enviado(mensagem) {
    setSelecionados(new Set())
    depoisDoEnvio(mensagem)
  }

  async function acaoEmLote(acao) {
    const resposta = await acao(escolhidos)
    if (resposta) setSelecionados(new Set())
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">
            {tr('Leads')} <span className="badge badge--primary">{total.toLocaleString(localeAtual())}</span>
          </h2>
          <p className="page-subtitle">{tr('Empresas captadas pela sua conta, sem repetição')}</p>
        </div>
        <div className="page-header__acoes">
          <button type="button" className={`btn btn--ghost${exportando ? ' btn--loading' : ''}`} onClick={exportar} disabled={exportando || total === 0}>
            {exportando ? tr('Exportando...') : tr('Exportar planilha')}
          </button>
          <Link className="btn btn--primary" to="/captacao">{tr('Captar mais')}</Link>
        </div>
      </header>

      {(erro || sucesso) && !aberto && !enviarPara && (
        <div className="alerts">
          {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
          {sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}
        </div>
      )}

      <section className="card leads">
        <div className="leads__filtros">
          <label className="search leads__busca">
            <IconeBusca />
            <input className="input" type="search" value={texto} onChange={(e) => setTexto(e.target.value)}
              placeholder={tr('Nome, telefone, e-mail, cidade...')} aria-label={tr('Buscar leads')} />
          </label>
          <select className="input" value={filtros.fonte} onChange={(e) => mudarFiltro('fonte', e.target.value)} aria-label={tr('Fonte')}>
            <option value="">{tr('Todas as fontes')}</option>
            {Object.entries(ROTULO_FONTE).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
          <select className="input" value={filtros.status} onChange={(e) => mudarFiltro('status', e.target.value)} aria-label={tr('Situação')}>
            <option value="">{tr('Todas as situações')}</option>
            {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
          </select>
          <select className="input" value={filtros.comEmail} onChange={(e) => mudarFiltro('comEmail', e.target.value)} aria-label={tr('E-mail')}>
            <option value="">{tr('E-mail: todos')}</option>
            <option value="sim">{tr('Com e-mail')}</option>
            <option value="nao">{tr('Sem e-mail')}</option>
          </select>
          <select className="input" value={filtros.comTelefone} onChange={(e) => mudarFiltro('comTelefone', e.target.value)} aria-label={tr('Telefone')}>
            <option value="">{tr('Telefone: todos')}</option>
            <option value="sim">{tr('Com telefone')}</option>
          </select>
        </div>

        {filtros.buscaId && (
          <p className="alert alert--info leads__aviso-busca">
            {tr('Mostrando só os leads de uma busca.')}
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => mudarFiltro('buscaId', '')}>
              <IconeX /> {tr('Ver todos')}
            </button>
          </p>
        )}

        {escolhidos.length > 0 && (
          <div className="leads__lote" role="toolbar" aria-label={tr('Ações com os selecionados')}>
            <strong>{escolhidos.length === 1 ? tr('1 selecionado') : tr('{n} selecionados', { n: escolhidos.length })}</strong>
            {podeEnviar && (
              <button type="button" className="btn btn--sm btn--primary" onClick={() => setEnviarPara(escolhidos)}>
                <Icone>{ICONES.email}</Icone> {tr('Enviar e-mail')}
              </button>
            )}
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => acaoEmLote(procurarEmails)}>{tr('Procurar e-mail no site')}</button>
            <ConfirmarNoLugar rotulo={tr('Excluir selecionados')} pergunta={tr('Excluir {n}?', { n: escolhidos.length })} onConfirmar={() => acaoEmLote(excluirVarios)} />
          </div>
        )}

        {carregando && itens.length === 0 ? (
          <div className="leads__skeleton" aria-busy="true" aria-label={tr('Carregando')}>
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton skeleton--line" style={{ height: 48 }} />)}
          </div>
        ) : itens.length === 0 ? (
          temFiltro ? (
            <EstadoVazio icone={ICONES.leads} titulo={tr('Nenhum lead com esses filtros')} texto={tr('Tente outros filtros ou limpe a busca.')} />
          ) : (
            <EstadoVazio icone={ICONES.leads} titulo={tr('Nenhum lead ainda')} texto={tr('Faça uma busca na Captação para trazer as primeiras empresas.')}
              acao={<Link className="btn btn--primary" to="/captacao">{tr('Ir para a Captação')}</Link>} />
          )
        ) : (
          <div className="table-wrap" aria-busy={carregando}>
            <table className="table leads__tabela">
              <thead>
                <tr>
                  <th className="leads__check">
                    <input type="checkbox" checked={todosMarcados} onChange={alternarTodos} aria-label={tr('Selecionar todos desta página')} />
                  </th>
                  <th>{tr('Empresa')}</th>
                  <th>{tr('Contato')}</th>
                  <th>{tr('Local')}</th>
                  <th>{tr('Situação')}</th>
                  <th>{tr('Ações')}</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((lead, i) => (
                  <tr key={lead._id} className="leads__linha" style={{ '--i': Math.min(i, 10) }}>
                    <td className="leads__check">
                      <input type="checkbox" checked={selecionados.has(lead._id)} onChange={() => alternar(lead._id)} aria-label={tr('Selecionar {nome}', { nome: lead.nome })} />
                    </td>
                    <td className="leads__td-empresa">
                      <button type="button" className="leads__nome" onClick={() => setAberto(lead)}>{lead.nome}</button>
                      <small>{[lead.categoria, lead.contato].filter(Boolean).join(' · ')}</small>
                      <span className="badge leads__fonte">{ROTULO_FONTE[lead.fonte] ?? lead.fonte}</span>
                    </td>
                    <td className="leads__td-contato">
                      {lead.telefone && <a className="link" href={`tel:${lead.telefone}`}>{lead.telefone}</a>}
                      <CelulaEmail lead={lead} />
                      {lead.site && <a className="link leads__site" href={linkDoSite(lead.site)} target="_blank" rel="noreferrer">{siteSemProtocolo(lead.site)}</a>}
                    </td>
                    <td className="leads__td-local">{[lead.cidade, lead.estado].filter(Boolean).join(', ') || '—'}</td>
                    <td className="leads__td-situacao">
                      <select className="input leads__status" data-status={lead.status} value={lead.status}
                        onChange={(e) => salvar(lead._id, { status: e.target.value })} aria-label={tr('Situação de {nome}', { nome: lead.nome })}>
                        {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
                      </select>
                    </td>
                    <td className="leads__td-acoes">
                      <div className="table__actions">
                        <button type="button" className="icon-btn" aria-label={tr('Ver e editar')} title={tr('Ver e editar')} onClick={() => setAberto(lead)}>
                          <IconeLapis />
                        </button>
                        <ConfirmarNoLugar rotulo={tr('Excluir lead')} onConfirmar={() => excluir(lead._id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPaginas > 1 && (
          <nav className="leads__paginacao" aria-label={tr('Páginas')}>
            <button type="button" className="icon-btn" aria-label={tr('Página anterior')} disabled={pagina <= 1} onClick={() => irParaPagina(pagina - 1)}>
              <IconeSetaEsq />
            </button>
            <span>{tr('Página {pagina} de {total}', { pagina, total: totalPaginas })}</span>
            <button type="button" className="icon-btn" aria-label={tr('Próxima página')} disabled={pagina >= totalPaginas} onClick={() => irParaPagina(pagina + 1)}>
              <IconeSetaDir />
            </button>
          </nav>
        )}
      </section>

      {enviarPara && (
        <EnviarEmailModal ids={enviarPara} onEnviado={enviado} onClose={() => setEnviarPara(null)} />
      )}

      {aberto && (
        <LeadModal lead={aberto} erro={erro} onSalvar={salvar} onClose={() => setAberto(null)} />
      )}
    </div>
  )
}
