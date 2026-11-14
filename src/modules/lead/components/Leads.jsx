import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LeadModal from './LeadModal'
import EnviarEmailModal from '@/modules/envio/components/EnviarEmailModal'
import { useAuthContext } from '@/hooks/useAuthContext'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import { Icone, IconeBusca, IconeLapis, IconeSetaDir, IconeSetaEsq, IconeX } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useLeads } from '../lead.hooks'
import { CANAIS_CONTATO, FILTROS_VAZIOS, ROTULO_EMAIL, ROTULO_FONTE, STATUS, emBuscaDeEmail, situacaoDoFollowUp } from '../lead.utils'
import { CelulaTexto } from '@/components/Planilha/Celulas'
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
  return (
    <span className={`badge${emBuscaDeEmail(lead) ? ' badge--info badge--live' : ''}`}>{ROTULO_EMAIL[lead.emailStatus] ?? lead.emailStatus}</span>
  )
}

// Cor da célula de situação, pelas regras da planilha.
const ESTADO_DA_SITUACAO = { cliente: 'feito', descartado: 'inativo', demo: 'destaque', teste_gratis: 'destaque', respondeu: 'info', interessado: 'info' }
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

  const { itens, total, porPagina, carregando, erro, sucesso, exportando, criar, salvar, excluir, excluirVarios, procurarEmails, registrarContato, exportar, depoisDoEnvio } = useLeads(filtros, pagina)
  const { hasRole } = useAuthContext()
  const podeEnviar = hasRole('admin') || hasRole('super_admin')
  const [enviarPara, setEnviarPara] = useState(null)
  const [texto, setTexto] = useState(filtros.busca)
  const [selecionados, setSelecionados] = useState(() => new Set())
  const [aberto, setAberto] = useState(null)
  // Depois de cadastrar, o campo da linha nova nasce de novo, vazio.
  const [versaoDoNovo, setVersaoDoNovo] = useState(0)

  async function criarLead(nome) {
    if (!nome) return
    if (await criar({ nome })) setVersaoDoNovo((v) => v + 1)
  }

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

  const celula = (lead, campo, rotulo, extra = {}) => (
    <CelulaTexto valor={lead[campo]} rotulo={`${rotulo} · ${lead.nome}`} onSalvar={(valor) => salvar(lead._id, { [campo]: valor })} {...extra} />
  )

  return (
    <div className="page page--planilha">
      <header className="plan-titulo">
        <div>
          <h2>{tr('Leads')} · {total.toLocaleString(localeAtual())}</h2>
          <p>{tr('Cadastre na primeira linha ou busque nas fontes. Linha laranja = follow-up para hoje. O próximo follow-up é calculado sozinho (3, 7 e 14 dias).')}</p>
        </div>
        <div className="plan-titulo__acoes">
          <button type="button" className={`btn btn--sm${exportando ? ' btn--loading' : ''}`} onClick={exportar} disabled={exportando || total === 0}>
            {exportando ? tr('Exportando...') : tr('Exportar planilha')}
          </button>
          <Link className="btn btn--sm btn--primary" to="/captacao">{tr('Buscar leads')}</Link>
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
        <div className="plan-wrap plan-carregando" aria-busy="true" aria-label={tr('Carregando')}>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton skeleton--line" style={{ height: 30 }} />)}
        </div>
      ) : (
        <div className="plan-wrap" aria-busy={carregando}>
          <table className="plan plan--bandas leads__tabela">
            <thead>
              <tr>
                <th className="plan__num">
                  <input type="checkbox" className="plan__caixa" checked={todosMarcados} onChange={alternarTodos} aria-label={tr('Selecionar todos desta página')} />
                </th>
                <th>{tr('Data cadastro')}</th>
                <th className="leads__col-nome">{tr('Nome / Clínica')}</th>
                <th>{tr('Especialidade')}</th>
                <th>{tr('Cidade / UF')}</th>
                <th>{tr('Telefone')}</th>
                <th>{tr('E-mail')}</th>
                <th>{tr('Instagram')}</th>
                <th>{tr('Origem')}</th>
                <th>{tr('Canal do 1º contato')}</th>
                <th>{tr('Data 1º contato')}</th>
                <th>{tr('Último contato')}</th>
                <th>{tr('Nº de contatos')}</th>
                <th>{tr('Status')}</th>
                <th>{tr('Próximo follow-up (auto)')}</th>
                <th>{tr('Observações')}</th>
                <th aria-label={tr('Ações')} />
              </tr>
            </thead>
            <tbody>
              {pagina === 1 && (
                <tr className="plan__nova">
                  <td className="plan__num">+</td>
                  <td />
                  <td className="plan__edit leads__col-nome">
                    <input key={versaoDoNovo} className="plan__input" type="text" placeholder={tr('Digite o nome do lead novo')} aria-label={tr('Digite o nome do lead novo')}
                      onBlur={(e) => criarLead(e.target.value.trim())} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }} />
                  </td>
                  <td colSpan={14} className="leads__dica">{tr('Digite o nome e aperte Enter. Depois preencha o resto na própria linha.')}</td>
                </tr>
              )}
              {itens.length === 0 && (
                <tr>
                  <td className="plan__num" />
                  <td colSpan={16} className="leads__dica">
                    {temFiltro ? tr('Nenhum lead com esses filtros. Tente outros filtros ou limpe a busca.') : tr('Nenhum lead ainda. Cadastre na linha acima ou busque nas fontes.')}
                  </td>
                </tr>
              )}
              {itens.map((lead) => (
                <tr key={lead._id} data-estado={situacaoDoFollowUp(lead) === 'vencido' ? 'aviso' : ''} data-riscado={lead.status === 'descartado'}>
                  <td className="plan__num">
                    <input type="checkbox" className="plan__caixa" checked={selecionados.has(lead._id)} onChange={() => alternar(lead._id)} aria-label={tr('Selecionar {nome}', { nome: lead.nome })} />
                  </td>
                  <td className="nowrap">{dataCurta(lead.createdAt)}</td>
                  <td className="plan__edit leads__col-nome">{celula(lead, 'nome', tr('Nome / Clínica'))}</td>
                  <td className="plan__edit">{celula(lead, 'categoria', tr('Especialidade'))}</td>
                  <td className="plan__edit">
                    <span className="leads__local">
                      {celula(lead, 'cidade', tr('Cidade'))}
                      {celula(lead, 'estado', tr('UF'), { maximo: 2, placeholder: tr('UF') })}
                    </span>
                  </td>
                  <td className="plan__edit">{celula(lead, 'telefone', tr('Telefone'), { tipo: 'tel' })}</td>
                  <td className="leads__td-email"><CelulaEmail lead={lead} /></td>
                  <td className="plan__edit">{celula(lead, 'instagram', tr('Instagram'), { placeholder: '@' })}</td>
                  {lead.fonte === 'manual'
                    ? <td className="plan__edit">{celula(lead, 'origem', tr('Origem'))}</td>
                    : <td className="nowrap">{ROTULO_FONTE[lead.fonte] ?? lead.fonte}</td>}
                  <td className="nowrap">{ROTULO_CANAL[lead.canalPrimeiroContato] ?? ''}</td>
                  <td className="nowrap">{dataCurta(lead.primeiroContatoEm)}</td>
                  <td className="nowrap">{dataCurta(lead.ultimoContatoEm)}</td>
                  <td className="plan__edit">
                    <span className="leads__contatos">
                      <strong>{lead.numeroContatos ?? 0}</strong>
                      <select className="plan__input" value="" onChange={(e) => registrarContato(lead._id, e.target.value)}
                        aria-label={tr('Registrar contato com {nome}', { nome: lead.nome })}>
                        <option value="">{tr('+ contato')}</option>
                        {CANAIS_CONTATO.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
                      </select>
                    </span>
                  </td>
                  <td className="plan__edit" data-estado={ESTADO_DA_SITUACAO[lead.status] ?? ''}>
                    <select className="plan__input leads__status" value={lead.status}
                      onChange={(e) => salvar(lead._id, { status: e.target.value })} aria-label={tr('Status de {nome}', { nome: lead.nome })}>
                      {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
                    </select>
                  </td>
                  <td className="nowrap"><ProximoFollowUp lead={lead} /></td>
                  <td className="plan__edit">{celula(lead, 'observacao', tr('Observações'))}</td>
                  <td className="plan__acoes">
                    <div className="table__actions">
                      {podeEnviar && lead.email && (
                        <button type="button" className="icon-btn" onClick={() => setEnviarPara([lead._id])}
                          aria-label={tr('Enviar e-mail para {nome}', { nome: lead.nome })} title={tr('Enviar e-mail')}>
                          <Icone>{ICONES.email}</Icone>
                        </button>
                      )}
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

      {enviarPara && (
        <EnviarEmailModal ids={enviarPara} onEnviado={enviado} onClose={() => setEnviarPara(null)} />
      )}

      {aberto && (
        <LeadModal lead={aberto} erro={erro} onSalvar={salvar} onClose={() => setAberto(null)} />
      )}
    </div>
  )
}
