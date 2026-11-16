import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LeadModal from './LeadModal'
import EnviarEmailModal from '@/modules/envio/components/EnviarEmailModal'
import { useAuthContext } from '@/hooks/useAuthContext'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import { Icone, IconeBusca, IconeLapis, IconeMais, IconeSetaDir, IconeSetaEsq, IconeX } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useLeads } from '../lead.hooks'
import { CANAIS_CONTATO, FILTROS_VAZIOS, ROTULO_EMAIL, ROTULO_FONTE, STATUS, emBuscaDeEmail, situacaoDoFollowUp } from '../lead.utils'
import { dataCurta } from '@/components/Planilha/planilha.utils'
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
  if (lead.emailStatus === 'nao_buscado') return null
  return (
    <span className={`badge${emBuscaDeEmail(lead) ? ' badge--info badge--live' : ''}`}>{ROTULO_EMAIL[lead.emailStatus] ?? lead.emailStatus}</span>
  )
}

// Cor da célula de situação, pelas regras da planilha.
const ESTADO_DA_SITUACAO = { cliente: 'feito', descartado: 'inativo', demo: 'destaque', teste_gratis: 'destaque', respondeu: 'info', follow_up: 'info', interessado: 'info' }
const ROTULO_CANAL = Object.fromEntries(CANAIS_CONTATO.map((canal) => [canal.valor, canal.rotulo]))

// Próximo follow-up (3, 7 e 14 dias depois do primeiro contato) ou o aviso de encerrar.
function ProximoFollowUp({ lead }) {
  const situacao = situacaoDoFollowUp(lead)
  if (situacao === 'encerrar') return <span className="badge badge--danger">{tr('Encerrar')}</span>
  if (!situacao) return null
  return <>{dataCurta(lead.proximoFollowUpEm)}{situacao === 'vencido' && <span className="badge badge--warning leads__hoje">{tr('Fazer')}</span>}</>
}

export default function Leads() {
  const [params, setParams] = useSearchParams()
  const filtros = useMemo(() => {
    const lidos = { ...FILTROS_VAZIOS }
    Object.keys(lidos).forEach((chave) => { lidos[chave] = params.get(chave) ?? '' })
    return lidos
  }, [params])
  const pagina = Math.max(1, Number(params.get('pagina')) || 1)

  const { itens, total, porPagina, carregando, erro, sucesso, exportando, limparAvisos, criar, salvar, excluir, excluirVarios, procurarEmails, registrarContato, exportar, depoisDoEnvio } = useLeads(filtros, pagina)
  const { hasRole } = useAuthContext()
  const podeEnviar = hasRole('admin') || hasRole('super_admin')
  const [enviarPara, setEnviarPara] = useState(null)
  const [texto, setTexto] = useState(filtros.busca)
  const [selecionados, setSelecionados] = useState(() => new Set())
  const [aberto, setAberto] = useState(null)
  const [todosDe, setTodosDe] = useState(null)

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
  // "Todos os leads da lista" (não só os da página) vale para os filtros em que foi escolhido.
  const chaveDosFiltros = JSON.stringify(filtros)
  const todosDaLista = todosMarcados && todosDe === chaveDosFiltros && total > itens.length
  const quantosEscolhidos = todosDaLista ? total : escolhidos.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  // A ordem não é filtro: não muda quais leads aparecem.
  const temFiltro = Object.entries(filtros).some(([campo, valor]) => campo !== 'ordem' && valor)

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
    setTodosDe(null)
  }

  function limparSelecao() {
    setSelecionados(new Set())
    setTodosDe(null)
  }

  function enviado(mensagem) {
    limparSelecao()
    depoisDoEnvio(mensagem)
  }

  async function acaoEmLote(acao) {
    const filtrosPreenchidos = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor))
    const resposta = await acao(todosDaLista ? { todos: true, filtros: filtrosPreenchidos } : { ids: escolhidos })
    if (resposta) limparSelecao()
  }

  function abrir(lead) {
    limparAvisos()
    setAberto(lead)
  }

  return (
    <div className="page page--planilha">
      <header className="plan-titulo">
        <div>
          <h2>{tr('Leads')} · {total.toLocaleString(localeAtual())}</h2>
          <p>{tr('Linha laranja = follow-up para hoje. O próximo follow-up é calculado sozinho (3, 7 e 14 dias). Toque num lead para ver e editar.')}</p>
        </div>
        <div className="plan-titulo__acoes">
          <button type="button" className={`btn btn--sm${exportando ? ' btn--loading' : ''}`} onClick={exportar} disabled={exportando || total === 0}>
            {exportando ? tr('Exportando...') : tr('Exportar planilha')}
          </button>
          <Link className="btn btn--sm" to="/captacao">{tr('Buscar leads')}</Link>
          <button type="button" className="btn btn--sm btn--primary" onClick={() => abrir('novo')}><IconeMais /> {tr('Adicionar lead')}</button>
        </div>
      </header>

      {(erro || sucesso) && !aberto && !enviarPara && (
        <div className="leads__avisos">
          {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
          {sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}
        </div>
      )}

      <div className="leads__filtros">
        <label className="search leads__busca">
          <IconeBusca />
          <input className="input" type="search" value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder={tr('Nome, telefone, e-mail, cidade...')} aria-label={tr('Buscar leads')} />
        </label>
        <select className="input" value={filtros.ordem} onChange={(e) => mudarFiltro('ordem', e.target.value)} aria-label={tr('Ordem')}>
          <option value="">{tr('Mais recentes primeiro')}</option>
          <option value="antigos">{tr('Mais antigos primeiro')}</option>
        </select>
        <select className="input" value={filtros.status} onChange={(e) => mudarFiltro('status', e.target.value)} aria-label={tr('Status')}>
          <option value="">{tr('Todos os status')}</option>
          {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
        </select>
        <select className="input" value={filtros.followUp} onChange={(e) => mudarFiltro('followUp', e.target.value)} aria-label={tr('Follow-up')}>
          <option value="">{tr('Follow-up: todos')}</option>
          <option value="vencido">{tr('Follow-up para hoje')}</option>
          <option value="encerrar">{tr('Sem resposta: encerrar')}</option>
        </select>
        <select className="input" value={filtros.fonte} onChange={(e) => mudarFiltro('fonte', e.target.value)} aria-label={tr('Origem')}>
          <option value="">{tr('Todas as origens')}</option>
          {Object.entries(ROTULO_FONTE).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
        </select>
        <select className="input" value={filtros.comEmail} onChange={(e) => mudarFiltro('comEmail', e.target.value)} aria-label={tr('E-mail')}>
          <option value="">{tr('E-mail: todos')}</option>
          <option value="sim">{tr('Com e-mail')}</option>
          <option value="gmail_yahoo">{tr('Só Gmail e Yahoo')}</option>
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
          <strong>{quantosEscolhidos === 1 ? tr('1 selecionado') : tr('{n} selecionados', { n: quantosEscolhidos.toLocaleString(localeAtual()) })}</strong>
          {todosMarcados && total > itens.length && (todosDaLista ? (
            <button type="button" className="btn btn--sm btn--ghost" onClick={limparSelecao}>{tr('Limpar seleção')}</button>
          ) : (
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setTodosDe(chaveDosFiltros)}>
              {temFiltro ? tr('Selecionar todos os {n} desta lista', { n: total.toLocaleString(localeAtual()) }) : tr('Selecionar todos os {n} leads', { n: total.toLocaleString(localeAtual()) })}
            </button>
          ))}
          {podeEnviar && !todosDaLista && (
            <button type="button" className="btn btn--sm btn--primary" onClick={() => setEnviarPara(escolhidos)}>
              <Icone>{ICONES.email}</Icone> {tr('Enviar e-mail')}
            </button>
          )}
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => acaoEmLote(procurarEmails)}>{tr('Procurar e-mail no site')}</button>
          <ConfirmarNoLugar rotulo={tr('Excluir selecionados')} pergunta={tr('Excluir {n}?', { n: quantosEscolhidos.toLocaleString(localeAtual()) })} onConfirmar={() => acaoEmLote(excluirVarios)} />
        </div>
      )}

      {carregando && itens.length === 0 ? (
        <div className="plan-wrap plan-carregando" aria-busy="true" aria-label={tr('Carregando')}>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton skeleton--line" style={{ height: 30 }} />)}
        </div>
      ) : (
        <div className="plan-wrap" aria-busy={carregando}>
          <table className="plan plan--bandas plan--ajustada leads__tabela">
            <colgroup>
              <col className="plan__col-num" />
              <col style={{ width: '20%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '14%' }} />
              <col className="leads__col-acoes" />
            </colgroup>
            <thead>
              <tr>
                <th className="plan__num">
                  <input type="checkbox" className="plan__caixa" checked={todosMarcados} onChange={alternarTodos} aria-label={tr('Selecionar todos desta página')} />
                </th>
                <th>{tr('Nome / Clínica')}</th>
                <th>{tr('Cidade / UF')}</th>
                <th>{tr('Contato')}</th>
                <th>{tr('Contatos feitos')}</th>
                <th>{tr('Status')}</th>
                <th>{tr('Próximo follow-up')}</th>
                <th>{tr('Observações')}</th>
                <th className="plan__acoes" aria-label={tr('Ações')} />
              </tr>
            </thead>
            <tbody>
              {itens.length === 0 && (
                <tr>
                  <td className="plan__num" />
                  <td colSpan={8} className="plan-dica">
                    {temFiltro ? tr('Nenhum lead com esses filtros. Tente outros filtros ou limpe a busca.') : tr('Nenhum lead ainda. Toque em "Adicionar lead" ou busque nas fontes.')}
                  </td>
                </tr>
              )}
              {itens.map((lead) => (
                <tr key={lead._id} className="plan__linha" data-estado={situacaoDoFollowUp(lead) === 'vencido' ? 'aviso' : ''} data-riscado={lead.status === 'descartado'}>
                  <td className="plan__num">
                    <input type="checkbox" className="plan__caixa" checked={selecionados.has(lead._id)} onChange={() => alternar(lead._id)} aria-label={tr('Selecionar {nome}', { nome: lead.nome })} />
                  </td>
                  <td className="plan__texto" onClick={() => abrir(lead)}>
                    <strong className="leads__nome">{lead.nome}</strong>
                    {lead.categoria && <small>{lead.categoria}</small>}
                    <small>{[lead.fonte === 'manual' ? lead.origem : (ROTULO_FONTE[lead.fonte] ?? lead.fonte), dataCurta(lead.createdAt)].filter(Boolean).join(' · ')}</small>
                  </td>
                  <td className="plan__texto" onClick={() => abrir(lead)}>{[lead.cidade, lead.estado].filter(Boolean).join(' / ')}</td>
                  <td className="leads__td-contato">
                    {lead.telefone && <a className="link" href={`tel:${lead.telefone}`}>{lead.telefone}</a>}
                    <CelulaEmail lead={lead} />
                    {lead.instagram && <small>{lead.instagram}</small>}
                  </td>
                  <td className="plan__edit">
                    <span className="leads__contatos">
                      <strong>{lead.numeroContatos ?? 0}</strong>
                      <select className="plan__input plan__rapido" value="" onChange={(e) => registrarContato(lead._id, e.target.value)}
                        aria-label={tr('Registrar contato com {nome}', { nome: lead.nome })}>
                        <option value="">{tr('+ contato')}</option>
                        {CANAIS_CONTATO.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
                      </select>
                    </span>
                    {lead.primeiroContatoEm && (
                      <small className="leads__ultimo">
                        {tr('1º: {canal} · {data}', { canal: ROTULO_CANAL[lead.canalPrimeiroContato] ?? '', data: dataCurta(lead.primeiroContatoEm) })}
                        {lead.numeroContatos > 1 && <><br />{tr('último {data}', { data: dataCurta(lead.ultimoContatoEm) })}</>}
                      </small>
                    )}
                  </td>
                  <td className="plan__edit" data-estado={ESTADO_DA_SITUACAO[lead.status] ?? ''}>
                    <select className="plan__input plan__rapido leads__status" value={lead.status}
                      onChange={(e) => salvar(lead._id, { status: e.target.value })} aria-label={tr('Status de {nome}', { nome: lead.nome })}>
                      {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
                    </select>
                  </td>
                  <td><ProximoFollowUp lead={lead} /></td>
                  <td className="plan__texto leads__obs" onClick={() => abrir(lead)}>{lead.observacao}</td>
                  <td className="plan__acoes">
                    <div className="table__actions">
                      {podeEnviar && lead.email && (
                        <button type="button" className="icon-btn" onClick={() => setEnviarPara([lead._id])}
                          aria-label={tr('Enviar e-mail para {nome}', { nome: lead.nome })} title={tr('Enviar e-mail')}>
                          <Icone>{ICONES.email}</Icone>
                        </button>
                      )}
                      <button type="button" className="icon-btn" aria-label={tr('Ver e editar')} title={tr('Ver e editar')} onClick={() => abrir(lead)}>
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

      {enviarPara && (
        <EnviarEmailModal ids={enviarPara} onEnviado={enviado} onClose={() => setEnviarPara(null)} />
      )}

      {aberto && (
        <LeadModal lead={aberto === 'novo' ? null : aberto} erro={erro} onCriar={criar}
          onSalvar={salvar} onClose={() => setAberto(null)} />
      )}
    </div>
  )
}
