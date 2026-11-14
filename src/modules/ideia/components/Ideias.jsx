import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import ItemModal from '@/components/Planilha/ItemModal'
import TelaDePlanilha from '@/components/Planilha/TelaDePlanilha'
import { IconeLapis, IconeMais } from '@/components/CrudCard/icones'
import { diaCurto, diaDaSemanaCurto, somarDias } from '@/modules/rotina/rotina.utils'
import { useIdeias } from '../ideia.hooks'
import { CONFIG_DO_TIPO, diasDoPeriodo, porDia } from '../ideia.utils'
import { tr } from '@/i18n'
import './ideias.css'

const ESTADO_DO_STATUS = { pronto: 'info', publicado: 'feito' }

function CartaoDaIdeia({ ideia, config, numero, onAbrir, onStatus, onExcluir }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(ideia.legenda)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <article className="ideia" data-estado={ESTADO_DO_STATUS[ideia.status] ?? ''}>
      <header className="ideia__topo">
        <button type="button" className="ideia__titulo" onClick={onAbrir}>
          {ideia.titulo || tr('Ideia {n}', { n: numero })}
        </button>
        <select className="input ideia__status" value={ideia.status} onChange={(e) => onStatus(e.target.value)}
          aria-label={tr('Situação de {nome}', { nome: ideia.titulo || tr('Ideia {n}', { n: numero }) })}>
          {config.status.map((status) => <option key={status.valor} value={status.valor}>{status.rotulo}</option>)}
        </select>
      </header>

      <button type="button" className="ideia__corpo" onClick={onAbrir}>
        <span className="ideia__rotulo">{config.roteiro}</span>
        <span className="ideia__texto">{ideia.roteiro || '—'}</span>
        <span className="ideia__rotulo">{config.legenda}</span>
        <span className="ideia__texto ideia__texto--curto">{ideia.legenda || '—'}</span>
      </button>

      <footer className="ideia__acoes">
        {ideia.legenda && (
          <button type="button" className="btn btn--sm btn--ghost" onClick={copiar}>{copiado ? tr('Copiado!') : config.copiar}</button>
        )}
        <span className="ideia__icones">
          <button type="button" className="icon-btn" aria-label={tr('Editar')} title={tr('Editar')} onClick={onAbrir}><IconeLapis /></button>
          <ConfirmarNoLugar onConfirmar={onExcluir} />
        </span>
      </footer>
    </article>
  )
}

function Dia({ titulo, hoje, ideias, config, onNova, onAbrir, salvar, excluir }) {
  return (
    <section className="ideias-dia" data-hoje={hoje}>
      <header className="ideias-dia__topo">
        <h3>{titulo}</h3>
        {ideias.length > 0 && <span className="badge">{ideias.length}</span>}
        <button type="button" className="btn btn--sm btn--ghost ideias-dia__nova" onClick={onNova}><IconeMais /> {tr('Adicionar')}</button>
      </header>
      {ideias.length === 0 ? (
        <p className="ideias-dia__vazio">{tr('Nada para este dia.')}</p>
      ) : (
        <div className="ideias-dia__lista">
          {ideias.map((ideia, i) => (
            <CartaoDaIdeia key={ideia._id} ideia={ideia} config={config} numero={i + 1} onAbrir={() => onAbrir(ideia)}
              onStatus={(status) => salvar(ideia._id, { status })} onExcluir={() => excluir(ideia._id)} />
          ))}
        </div>
      )}
    </section>
  )
}

// Uma ponta da lista: quando aparece na tela, carrega mais dias para aquele lado.
function Ponta({ ativa, onVisivel, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const elemento = ref.current
    if (!ativa || !elemento) return undefined
    const observador = new IntersectionObserver(([entrada]) => { if (entrada.isIntersecting) onVisivel() }, { rootMargin: '300px 0px' })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [ativa, onVisivel])
  return <div ref={ref} className="ideias__ponta">{children}</div>
}

// Ideias de vídeo (roteiro + legenda) ou de artigo (texto + resumo), dia a dia. Abre com o dia de hoje no topo;
// rolando para baixo vem o futuro e para cima o passado, carregando mais dias sozinho.
export default function Ideias({ tipo }) {
  const config = CONFIG_DO_TIPO[tipo]
  const { hoje, periodo, ideias, carregadoDe, erro, sucesso, limparAvisos, criar, salvar, excluir, maisPassado, maisFuturo } = useIdeias(tipo)
  const [modal, setModal] = useState(null)
  const [verBanco, setVerBanco] = useState(false)
  const diaDeHoje = useRef(null)
  // As pontas só carregam mais depois que a tela já rolou até hoje (senão a de cima dispararia logo de cara).
  const [pronta, setPronta] = useState(false)
  const grupos = ideias ? porDia(ideias) : null
  const dias = diasDoPeriodo(periodo.de, periodo.ate, somarDias)

  const carregou = !!ideias
  useEffect(() => {
    if (!carregou) return undefined
    diaDeHoje.current?.scrollIntoView({ block: 'start' })
    // Espera a rolagem assentar antes de ligar as pontas.
    const timer = setTimeout(() => setPronta(true), 400)
    return () => clearTimeout(timer)
  }, [carregou])

  // Ao carregar dias anteriores, a tela não pode pular: guarda o dia que está no topo e, depois que os dias novos
  // (e as ideias deles) aparecem em cima, rola de volta para ele. Feito à mão porque o Safari não faz sozinho.
  const ancora = useRef(null)
  function carregarPassado() {
    const visivel = [...document.querySelectorAll('.ideias__dia')].find((elemento) => elemento.getBoundingClientRect().bottom > 0)
    if (visivel) ancora.current = { dia: visivel.dataset.dia, topo: visivel.getBoundingClientRect().top, de: periodo.de }
    maisPassado()
  }
  useLayoutEffect(() => {
    const atual = ancora.current
    if (!atual) return
    const elemento = document.querySelector(`.ideias__dia[data-dia="${atual.dia}"]`)
    if (elemento) window.scrollBy(0, elemento.getBoundingClientRect().top - atual.topo)
    // Só solta a âncora quando as ideias do período novo já chegaram.
    if (carregadoDe === periodo.de && periodo.de !== atual.de) ancora.current = null
  }, [periodo.de, ideias, carregadoDe])

  const colunas = [
    { campo: 'dia', rotulo: tr('Dia de postar'), tipo: 'data' },
    { campo: 'status', rotulo: tr('Situação'), tipo: 'selecao', opcoes: config.status },
    { campo: 'titulo', rotulo: tr('Título'), exemplo: config.exemploTitulo, maximo: 200, largo: true },
    { campo: 'roteiro', rotulo: config.roteiro, tipo: 'textarea', linhas: 10, maximo: 20000 },
    { campo: 'legenda', rotulo: config.legenda, tipo: 'textarea', linhas: 5, maximo: 5000 },
  ]

  function abrir(item, dia = '') {
    limparAvisos()
    setModal({ item, dia })
  }

  const props = { config, onAbrir: abrir, salvar, excluir }
  return (
    <TelaDePlanilha titulo={config.titulo} subtitulo={config.subtitulo} erro={!modal && erro} carregando={!grupos}
      acoes={(
        <>
          <button type="button" className="btn btn--sm" onClick={() => diaDeHoje.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>{tr('Hoje')}</button>
          <button type="button" className="btn btn--sm" aria-pressed={verBanco} onClick={() => setVerBanco(!verBanco)}>
            {tr('Banco de ideias ({n})', { n: grupos?.[''].length ?? 0 })}
          </button>
          <button type="button" className="btn btn--sm btn--primary" onClick={() => abrir(null, hoje)}><IconeMais /> {config.novo}</button>
        </>
      )}>
      {!modal && sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}

      {grupos && verBanco && (
        <Dia titulo={tr('Sem data (banco de ideias)')} hoje={false} ideias={grupos['']} onNova={() => abrir(null, '')} {...props} />
      )}

      {grupos && (
        <div className="ideias">
          <Ponta ativa={pronta} onVisivel={carregarPassado}><span>{tr('Carregando dias anteriores...')}</span></Ponta>
          {dias.map((dia) => (
            <div key={dia} ref={dia === hoje ? diaDeHoje : undefined} className="ideias__dia" data-dia={dia}>
              <Dia titulo={`${dia === hoje ? `${tr('Hoje')} · ` : ''}${diaDaSemanaCurto(dia)} · ${diaCurto(dia)}`} hoje={dia === hoje}
                ideias={grupos[dia] ?? []} onNova={() => abrir(null, dia)} {...props} />
            </div>
          ))}
          <Ponta ativa={pronta} onVisivel={maisFuturo}><span>{tr('Carregando mais dias...')}</span></Ponta>
        </div>
      )}

      {modal && (
        <ItemModal titulo={modal.item ? config.editar : config.novo} colunas={colunas} erro={erro}
          item={modal.item} iniciais={{ dia: modal.dia, status: 'ideia' }}
          onSalvar={(dados) => (modal.item ? salvar(modal.item._id, dados) : criar(dados))} onClose={() => setModal(null)} />
      )}
    </TelaDePlanilha>
  )
}
