import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { CORES_DE_BLOCO } from '../rotina.utils'
import { tr } from '@/i18n'

export default function BlocoModal({ bloco, erro, onSalvar, onClose }) {
  const [form, setForm] = useState({ nome: bloco?.nome ?? '', cor: bloco?.cor ?? CORES_DE_BLOCO[0] })

  return (
    <Modal title={bloco ? tr('Editar bloco') : tr('Novo bloco')} onClose={onClose}>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onSalvar(form)} submitLabel={bloco ? tr('Salvar alterações') : tr('Criar bloco')}>
          <div className="field">
            <label className="field__label" htmlFor="bloco-nome">{tr('Nome do bloco')}</label>
            <input id="bloco-nome" className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder={tr('Ex.: 4. Vídeo')} required maxLength={60} />
          </div>
          <fieldset className="field cores">
            <legend className="field__label">{tr('Cor')}</legend>
            <div className="cores__lista">
              {CORES_DE_BLOCO.map((cor) => (
                <label key={cor} className="cores__cor" style={{ '--cor': cor }}>
                  <input type="radio" name="cor" value={cor} checked={form.cor === cor} onChange={() => setForm({ ...form, cor })} aria-label={cor} />
                </label>
              ))}
            </div>
          </fieldset>
        </ModalForm>
      )}
    </Modal>
  )
}
