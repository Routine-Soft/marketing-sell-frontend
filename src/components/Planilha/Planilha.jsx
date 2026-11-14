import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import { IconeLapis } from '@/components/CrudCard/icones'
import { comProtocolo, dataCurta, semProtocolo, textoDaOpcao } from './planilha.utils'
import { tr } from '@/i18n'

// Conteúdo de uma célula. Só caixinha e lista "rápida" mudam direto na grade; o resto se muda no modal.
function Celula({ coluna, linha, onSalvar, onAbrir }) {
  const valor = linha[coluna.campo]
  const estado = coluna.estado?.(linha) ?? ''
  const salvar = (novo) => onSalvar(linha._id, { [coluna.campo]: novo })
  const rotulo = `${coluna.rotulo} · ${linha[coluna.principal] ?? ''}`

  if (coluna.tipo === 'check') {
    return (
      <td className="plan__centro" data-estado={estado}>
        <input type="checkbox" className="plan__caixa" checked={!!valor} aria-label={rotulo} onChange={(e) => salvar(e.target.checked)} />
      </td>
    )
  }
  if (coluna.tipo === 'selecao' && coluna.rapido) {
    return (
      <td className="plan__edit" data-estado={estado}>
        <select className="plan__input plan__rapido" value={valor ?? ''} aria-label={rotulo} onChange={(e) => salvar(e.target.value)}>
          {coluna.vazio !== undefined && <option value="">{coluna.vazio}</option>}
          {coluna.opcoes.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
        </select>
      </td>
    )
  }

  let conteudo = valor
  if (coluna.ler) conteudo = coluna.ler(linha)
  else if (coluna.tipo === 'data' || coluna.tipo === 'leitura') conteudo = dataCurta(valor)
  else if (coluna.tipo === 'selecao') conteudo = textoDaOpcao(coluna.opcoes, valor)
  else if (coluna.tipo === 'link' && valor) {
    conteudo = <a className="link" href={comProtocolo(valor)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{semProtocolo(valor)}</a>
  }
  const linhaDeBaixo = coluna.sub?.(linha)
  return (
    <td className={`plan__texto${coluna.destaque ? ' plan__principal' : ''}`} data-estado={estado} onClick={onAbrir}>
      {conteudo}
      {linhaDeBaixo && <small className="plan__sub">{linhaDeBaixo}</small>}
    </td>
  )
}

// Tabela com cara de planilha, do tamanho da tela (o texto quebra linha em vez de sumir).
// colunas = [{ campo, rotulo, tipo, opcoes, peso, rapido, ler, sub, estado, soFormulario }]; tocar numa linha abre
// o modal de edição. Coluna com soFormulario só aparece no modal (o valor dela vai no "sub" de outra coluna).
export default function Planilha({ colunas: todas, linhas, principal, onEditar, onSalvar, onExcluir, estadoDaLinha, riscada, vazio }) {
  const colunas = todas.filter((coluna) => !coluna.soFormulario)
  return (
    <div className="plan-wrap">
      <table className="plan plan--bandas plan--ajustada">
        <colgroup>
          <col className="plan__col-num" />
          {colunas.map((coluna) => <col key={coluna.campo} style={{ width: `${coluna.peso ?? 10}%` }} />)}
          <col className="plan__col-acoes" />
        </colgroup>
        <thead>
          <tr>
            <th className="plan__num" aria-label={tr('Linha')} />
            {colunas.map((coluna) => <th key={coluna.campo}>{coluna.rotulo}</th>)}
            <th className="plan__acoes" aria-label={tr('Ações')} />
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 && (
            <tr>
              <td className="plan__num" />
              <td colSpan={colunas.length + 1} className="plan-dica">{vazio}</td>
            </tr>
          )}
          {linhas.map((linha, i) => (
            <tr key={linha._id} className="plan__linha" data-estado={estadoDaLinha?.(linha) ?? ''} data-riscado={riscada?.(linha) ?? false}>
              <td className="plan__num">{i + 1}</td>
              {colunas.map((coluna) => (
                <Celula key={coluna.campo} coluna={{ ...coluna, principal }} linha={linha} onSalvar={onSalvar} onAbrir={() => onEditar(linha)} />
              ))}
              <td className="plan__acoes">
                <div className="table__actions">
                  <button type="button" className="icon-btn" aria-label={tr('Editar {nome}', { nome: linha[principal] })} title={tr('Editar')} onClick={() => onEditar(linha)}>
                    <IconeLapis />
                  </button>
                  <ConfirmarNoLugar onConfirmar={() => onExcluir(linha._id)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
