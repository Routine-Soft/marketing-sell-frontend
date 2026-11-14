import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { tr } from '@/i18n'

// Guarda o negócio aberto (rotina, abas e listas) como modelo para usar em outros negócios.
export default function ModeloModal({ nomeDoNegocio, erro, onSalvar, onClose }) {
  const [form, setForm] = useState({ nome: tr('Rotina de {nome}', { nome: nomeDoNegocio ?? '' }), descricao: '' })
  const mudar = (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor }))

  return (
    <Modal title={tr('Salvar como modelo')} onClose={onClose}>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onSalvar(form)} submitLabel={tr('Salvar modelo')}>
          <p className="modal-form__hint">{tr('A rotina, as abas e as listas de preparação e anúncios de {nome} viram um modelo. Os leads e o que foi marcado não entram.', { nome: nomeDoNegocio ?? '' })}</p>
          <div className="field">
            <label className="field__label" htmlFor="modelo-nome">{tr('Nome do modelo')}</label>
            <input id="modelo-nome" className="input" value={form.nome} onChange={(e) => mudar('nome', e.target.value)} required maxLength={80} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="modelo-descricao">{tr('Para que serve (opcional)')}</label>
            <textarea id="modelo-descricao" className="input textarea" rows={3} value={form.descricao} onChange={(e) => mudar('descricao', e.target.value)} maxLength={300} />
          </div>
        </ModalForm>
      )}
    </Modal>
  )
}
