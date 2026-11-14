import { comProtocolo, diaDaData } from './planilha.utils'
import { tr } from '@/i18n'

// Células editáveis: o que a pessoa digita é salvo ao sair do campo (ou no Enter), como numa planilha.

export function CelulaTexto({ valor, onSalvar, rotulo, placeholder, tipo = 'text', maximo }) {
  function aoSair(e) {
    const novo = e.target.value.trim()
    if (novo !== (valor ?? '')) onSalvar(novo)
  }

  return (
    <input key={valor} className="plan__input" type={tipo} defaultValue={valor ?? ''} title={valor || undefined} aria-label={rotulo} placeholder={placeholder} maxLength={maximo}
      onBlur={aoSair} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }} />
  )
}

export function CelulaData({ valor, onSalvar, rotulo }) {
  return (
    <input className="plan__input" type="date" value={diaDaData(valor)} data-vazio={!valor} aria-label={rotulo} onChange={(e) => onSalvar(e.target.value)} />
  )
}

export function CelulaSelecao({ valor, opcoes, onSalvar, rotulo, vazio }) {
  return (
    <select className="plan__input" value={valor ?? ''} aria-label={rotulo} onChange={(e) => onSalvar(e.target.value)}>
      {vazio !== undefined && <option value="">{vazio}</option>}
      {opcoes.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
    </select>
  )
}

export function CelulaCheck({ valor, onSalvar, rotulo }) {
  return <input type="checkbox" className="plan__caixa" checked={!!valor} aria-label={rotulo} onChange={(e) => onSalvar(e.target.checked)} />
}

export function CelulaLink({ valor, onSalvar, rotulo }) {
  return (
    <span className="plan__com-link">
      <CelulaTexto valor={valor} onSalvar={onSalvar} rotulo={rotulo} />
      {valor && <a href={comProtocolo(valor)} target="_blank" rel="noreferrer">{tr('Abrir')}</a>}
    </span>
  )
}
