import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { diaDaData } from './planilha.utils'
import { tr } from '@/i18n'

function valorInicial(coluna, item) {
  const valor = item?.[coluna.campo]
  if (coluna.tipo === 'check') return !!valor
  if (coluna.tipo === 'data') return diaDaData(valor)
  if (coluna.tipo === 'selecao') return valor ?? coluna.padrao ?? (coluna.vazio !== undefined ? '' : coluna.opcoes[0]?.valor)
  return valor ?? ''
}

function Campo({ coluna, valor, onMudar }) {
  const id = `item-${coluna.campo}`
  if (coluna.tipo === 'check') {
    return (
      <label className="check item-form__check">
        <input type="checkbox" checked={valor} onChange={(e) => onMudar(e.target.checked)} /> {coluna.rotulo}
      </label>
    )
  }
  let campo
  if (coluna.tipo === 'selecao') {
    campo = (
      <select id={id} className="input" value={valor} onChange={(e) => onMudar(e.target.value)}>
        {coluna.vazio !== undefined && <option value="">{coluna.vazio}</option>}
        {coluna.opcoes.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>)}
      </select>
    )
  } else if (coluna.tipo === 'textarea') {
    campo = <textarea id={id} className="input textarea" rows={coluna.linhas ?? 3} value={valor} onChange={(e) => onMudar(e.target.value)} maxLength={coluna.maximo ?? 2000} />
  } else {
    const tipo = { data: 'date', link: 'text' }[coluna.tipo] ?? coluna.tipoDoCampo ?? 'text'
    campo = (
      <input id={id} className="input" type={tipo} value={valor} onChange={(e) => onMudar(e.target.value)} required={coluna.obrigatorio}
        placeholder={coluna.exemplo} maxLength={coluna.maximo ?? 300} />
    )
  }
  return (
    <div className={`field${coluna.tipo === 'textarea' || coluna.largo ? ' item-form__largo' : ''}`}>
      <label className="field__label" htmlFor={id}>{coluna.rotulo}</label>
      {campo}
    </div>
  )
}

// Modal de adicionar ou editar uma linha da planilha, montado com as mesmas colunas da tabela.
// iniciais = valores que já vêm preenchidos ao adicionar (ex.: o dia em que a pessoa tocou).
export default function ItemModal({ titulo, colunas, item, iniciais, erro, onSalvar, onClose }) {
  const doFormulario = colunas.filter((coluna) => coluna.tipo !== 'leitura' && coluna.formulario !== false)
  const [form, setForm] = useState(() => Object.fromEntries(doFormulario.map((coluna) => [coluna.campo, valorInicial(coluna, item ?? iniciais)])))

  return (
    <Modal title={titulo} onClose={onClose} wide={doFormulario.length > 4}>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onSalvar(form)} submitLabel={item ? tr('Salvar alterações') : tr('Adicionar')}>
          <div className="item-form">
            {doFormulario.map((coluna) => (
              <Campo key={coluna.campo} coluna={coluna} valor={form[coluna.campo]} onMudar={(valor) => setForm((atual) => ({ ...atual, [coluna.campo]: valor }))} />
            ))}
          </div>
        </ModalForm>
      )}
    </Modal>
  )
}
