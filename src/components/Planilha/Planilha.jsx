import { useState } from 'react'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import { CelulaCheck, CelulaData, CelulaLink, CelulaSelecao, CelulaTexto } from './Celulas'
import { dataCurta } from './planilha.utils'
import { tr } from '@/i18n'

const CELULAS = { texto: CelulaTexto, data: CelulaData, selecao: CelulaSelecao, check: CelulaCheck, link: CelulaLink }

function Celula({ coluna, linha, onSalvar }) {
  const valor = linha[coluna.campo]
  const estado = coluna.estado?.(linha) ?? ''
  if (coluna.tipo === 'leitura') {
    return <td data-estado={estado} className="nowrap">{coluna.ler ? coluna.ler(linha) : dataCurta(valor)}</td>
  }
  const Campo = CELULAS[coluna.tipo ?? 'texto']
  return (
    <td className={coluna.tipo === 'check' ? 'plan__centro' : 'plan__edit'} data-estado={estado}>
      <Campo valor={valor} rotulo={coluna.rotulo} opcoes={coluna.opcoes} vazio={coluna.vazio}
        onSalvar={(novo) => onSalvar(linha._id, { [coluna.campo]: novo })} />
    </td>
  )
}

// Tabela editável com cara de planilha. colunas = [{ campo, rotulo, tipo, largura, opcoes, estado }];
// a última linha é sempre a "linha nova": digitar no campo principal e sair cria o registro.
export default function Planilha({ colunas, linhas, campoNovo, textoNovo, onCriar, onSalvar, onExcluir, estadoDaLinha, riscada }) {
  const [criando, setCriando] = useState(false)
  // Depois de criar, o campo da linha nova nasce de novo, vazio.
  const [versaoDoNovo, setVersaoDoNovo] = useState(0)

  async function criar(texto) {
    if (!texto) return
    setCriando(true)
    const criou = await onCriar({ [campoNovo]: texto })
    setCriando(false)
    if (criou) setVersaoDoNovo((v) => v + 1)
  }

  return (
    <div className="plan-wrap">
      <table className="plan plan--bandas">
        <colgroup>
          <col />
          {colunas.map((coluna) => <col key={coluna.campo} style={{ minWidth: coluna.largura, width: coluna.largura }} />)}
          <col />
        </colgroup>
        <thead>
          <tr>
            <th className="plan__num" aria-label={tr('Linha')} />
            {colunas.map((coluna) => <th key={coluna.campo} style={{ minWidth: coluna.largura }}>{coluna.rotulo}</th>)}
            <th aria-label={tr('Ações')} />
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={linha._id} data-estado={estadoDaLinha?.(linha) ?? ''} data-riscado={riscada?.(linha) ?? false}>
              <td className="plan__num">{i + 1}</td>
              {colunas.map((coluna) => <Celula key={coluna.campo} coluna={coluna} linha={linha} onSalvar={onSalvar} />)}
              <td className="plan__acoes"><ConfirmarNoLugar onConfirmar={() => onExcluir(linha._id)} /></td>
            </tr>
          ))}
          <tr className="plan__nova">
            <td className="plan__num">+</td>
            {colunas.map((coluna) => (coluna.campo === campoNovo ? (
              <td key={coluna.campo} className="plan__edit">
                <input key={versaoDoNovo} className="plan__input" type="text" placeholder={textoNovo} aria-label={textoNovo} disabled={criando}
                  onBlur={(e) => criar(e.target.value.trim())} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }} />
              </td>
            ) : <td key={coluna.campo} />))}
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
