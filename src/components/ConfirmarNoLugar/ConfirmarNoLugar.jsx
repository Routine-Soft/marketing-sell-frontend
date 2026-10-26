import { useState } from 'react'
import { IconeCheck, IconeLixeira, IconeX } from '@/components/CrudCard/icones'
import { tr } from '@/i18n'
import './ConfirmarNoLugar.css'

// Botão de excluir que pede confirmação no próprio lugar: "Excluir? ✓ ✗" (nunca window.confirm).
export default function ConfirmarNoLugar({ onConfirmar, rotulo = tr('Excluir'), pergunta = tr('Excluir?'), desabilitado = false }) {
  const [confirmando, setConfirmando] = useState(false)
  const [executando, setExecutando] = useState(false)

  async function confirmar() {
    setExecutando(true)
    try {
      await onConfirmar()
    } finally {
      setExecutando(false)
      setConfirmando(false)
    }
  }

  if (!confirmando) {
    return (
      <button type="button" className="icon-btn icon-btn--danger" aria-label={rotulo} title={rotulo}
        disabled={desabilitado} onClick={() => setConfirmando(true)}>
        <IconeLixeira />
      </button>
    )
  }

  return (
    <span className="confirmar-no-lugar" role="group" aria-label={pergunta}>
      <span className="confirmar-no-lugar__pergunta">{pergunta}</span>
      <button type="button" className="icon-btn icon-btn--danger" aria-label={tr('Sim, excluir')} title={tr('Sim, excluir')}
        disabled={executando} onClick={confirmar}>
        <IconeCheck />
      </button>
      <button type="button" className="icon-btn" aria-label={tr('Cancelar')} title={tr('Cancelar')}
        disabled={executando} onClick={() => setConfirmando(false)}>
        <IconeX />
      </button>
    </span>
  )
}
