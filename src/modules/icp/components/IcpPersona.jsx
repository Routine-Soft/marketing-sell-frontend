import { useState } from 'react'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import ItemModal from '@/components/Planilha/ItemModal'
import TelaDePlanilha from '@/components/Planilha/TelaDePlanilha'
import { Icone, IconeLapis, IconeMais } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useIcps } from '../icp.hooks'
import { CAMPOS_DA_PERSONA, CAMPOS_DO_ICP, secoesPreenchidas } from '../icp.utils'
import { tr } from '@/i18n'
import './icp-persona.css'

function CartaoDaPersona({ persona, onAbrir, onExcluir }) {
  const resumo = CAMPOS_DA_PERSONA.filter((campo) => campo.resumo && persona[campo.campo])
  return (
    <article className="persona">
      <button type="button" className="persona__corpo" onClick={onAbrir}>
        <span className="persona__avatar" aria-hidden="true">{persona.nome.trim().charAt(0).toUpperCase()}</span>
        <span className="persona__nome">
          <strong>{persona.nome}</strong>
          {(persona.cargo || persona.idade) && <small>{[persona.cargo, persona.idade].filter(Boolean).join(' · ')}</small>}
        </span>
        {persona.frase && <q className="persona__frase">{persona.frase.replace(/^["“]|["”]$/g, '')}</q>}
        {resumo.length === 0 ? (
          <span className="persona__dica">{tr('Toque para preencher')}</span>
        ) : resumo.map((campo) => (
          <span key={campo.campo} className="persona__item">
            <span className="icp-rotulo">{campo.curto ?? campo.rotulo}</span>
            <span className="icp-valor">{persona[campo.campo]}</span>
          </span>
        ))}
      </button>
      <footer className="persona__acoes">
        <button type="button" className="icon-btn" aria-label={tr('Editar {nome}', { nome: persona.nome })} title={tr('Editar')} onClick={onAbrir}><IconeLapis /></button>
        <ConfirmarNoLugar onConfirmar={onExcluir} />
      </footer>
    </article>
  )
}

function PainelDoIcp({ icp, personas, onEditar, onExcluir, onNovaPersona, onAbrirPersona, onExcluirPersona }) {
  const secoes = secoesPreenchidas(CAMPOS_DO_ICP, icp, ['nome'])
  // Cada ICP começa fechado (só o título); tocar nele abre e fecha.
  const [aberto, setAberto] = useState(false)
  const idDoCorpo = `icp-${icp._id}`
  return (
    <section className="icp" data-aberto={aberto}>
      <header className="icp__topo">
        <button type="button" className="icp__titulo" aria-expanded={aberto} aria-controls={idDoCorpo} onClick={() => setAberto(!aberto)}>
          <span className="icp__seta" aria-hidden="true"><Icone><path d="m6 9 6 6 6-6" /></Icone></span>
          <span className="icp__selo">ICP</span>
          <h3>{icp.nome}</h3>
          <span className="icp__resumo">{tr('{n} persona(s)', { n: personas.length })}</span>
        </button>
        <span className="icp__acoes">
          <button type="button" className="icon-btn" aria-label={tr('Editar {nome}', { nome: icp.nome })} title={tr('Editar')} onClick={onEditar}><IconeLapis /></button>
          <ConfirmarNoLugar onConfirmar={onExcluir} pergunta={tr('Excluir o ICP e as personas?')} />
        </span>
      </header>

      {aberto && (
      <div id={idDoCorpo} className="icp__corpo">
        {secoes.length === 0 ? (
          <button type="button" className="icp__dica" onClick={onEditar}>{tr('Toque para preencher o perfil da empresa, a dor, o gatilho...')}</button>
        ) : secoes.map((secao) => (
          <div key={secao.titulo} className="icp__secao">
            <h4 className="icp__secao-titulo">{secao.titulo}</h4>
            <dl className="icp__campos">
              {secao.campos.map((campo) => (
                <div key={campo.campo} className={`icp__campo${campo.tipo === 'textarea' ? ' icp__campo--longo' : ''}`}>
                  <dt className="icp-rotulo">{campo.curto ?? campo.rotulo}</dt>
                  <dd className="icp-valor">{icp[campo.campo]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        <div className="icp__personas">
          <header className="icp__personas-topo">
            <h4>{tr('Personas')} <span className="badge">{personas.length}</span></h4>
            <button type="button" className="btn btn--sm" onClick={onNovaPersona}><IconeMais /> {tr('Nova persona')}</button>
          </header>
          {personas.length === 0 ? (
            <p className="icp__vazio">{tr('Nenhuma persona neste ICP. Crie a pessoa que decide ou usa: o que ela quer, o que a trava e onde encontrá-la.')}</p>
          ) : (
            <div className="icp__lista">
              {personas.map((persona) => (
                <CartaoDaPersona key={persona._id} persona={persona} onAbrir={() => onAbrirPersona(persona)} onExcluir={() => onExcluirPersona(persona._id)} />
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </section>
  )
}

// Aba "ICP e Persona": um painel por ICP (o tipo de cliente ideal) com as personas dele dentro.
export default function IcpPersona() {
  const { icps, personas, erro, sucesso, limparAvisos, criarIcp, salvarIcp, excluirIcp, criarPersona, salvarPersona, excluirPersona } = useIcps()
  const [modal, setModal] = useState(null)

  function abrir(tipo, item = null, icpId = '') {
    limparAvisos()
    setModal({ tipo, item, icpId })
  }

  const opcoesDeIcp = (icps ?? []).map((icp) => ({ valor: icp._id, rotulo: icp.nome }))
  const doModal = modal?.tipo === 'persona'
    ? {
        titulo: modal.item ? tr('Editar persona') : tr('Nova persona'),
        colunas: [
          // O ICP entra no topo do grupo "Quem é".
          { secao: CAMPOS_DA_PERSONA[0].secao, campo: 'icpId', rotulo: tr('ICP'), tipo: 'selecao', opcoes: opcoesDeIcp, largo: true },
          { ...CAMPOS_DA_PERSONA[0], secao: undefined },
          ...CAMPOS_DA_PERSONA.slice(1),
        ],
        iniciais: { icpId: modal.icpId },
        salvar: (form) => (modal.item ? salvarPersona(modal.item._id, form) : criarPersona(form)),
      }
    : {
        titulo: modal?.item ? tr('Editar ICP') : tr('Novo ICP'),
        colunas: CAMPOS_DO_ICP,
        iniciais: {},
        salvar: (form) => (modal.item ? salvarIcp(modal.item._id, form) : criarIcp(form)),
      }

  return (
    <TelaDePlanilha titulo={tr('ICP e Persona')}
      subtitulo={tr('ICP = o tipo de cliente que mais vale a pena atender. Persona = a pessoa, dentro dele, que decide ou usa.')}
      erro={!modal && erro} carregando={!icps}
      acoes={icps?.length > 0 && <button type="button" className="btn btn--sm btn--primary" onClick={() => abrir('icp')}><IconeMais /> {tr('Novo ICP')}</button>}>
      {!modal && sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}

      {icps?.length === 0 && (
        <div className="icp icp--vazio">
          <EstadoVazio icone={ICONES.persona} titulo={tr('Nenhum ICP ainda')}
            texto={tr('Comece pelo ICP: o tipo de cliente que mais vale a pena atender. Depois crie as personas dentro dele.')}
            acao={<button type="button" className="btn btn--primary" onClick={() => abrir('icp')}><IconeMais /> {tr('Novo ICP')}</button>} />
        </div>
      )}

      {icps?.map((icp) => (
        <PainelDoIcp key={icp._id} icp={icp} personas={personas.filter((p) => p.icpId === icp._id)}
          onEditar={() => abrir('icp', icp)} onExcluir={() => excluirIcp(icp._id)}
          onNovaPersona={() => abrir('persona', null, icp._id)} onAbrirPersona={(persona) => abrir('persona', persona)}
          onExcluirPersona={excluirPersona} />
      ))}

      {modal && (
        <ItemModal titulo={doModal.titulo} colunas={doModal.colunas} erro={erro} item={modal.item} iniciais={doModal.iniciais}
          onSalvar={doModal.salvar} onClose={() => setModal(null)} />
      )}
    </TelaDePlanilha>
  )
}
