import { useState } from 'react';
import Modal from '@/components/Modal/Modal';
import ModalForm from '@/components/Modal/ModalForm';
import { normalizarEmail } from '@/utils/email';
import { tr } from '@/i18n';

export default function EditarMinhaContaModal({ perfil, ehAdmin, erro, onSave, onClose }) {
  const [formEdicao, setFormEdicao] = useState({
    nomeCompleto: perfil.nomeCompleto,
    email: perfil.email,
    telefone: perfil.telefone ?? '',
    nomeEmpresa: perfil.nomeEmpresa ?? '',
  });

  function handleChangeEdicao(field, value) {
    setFormEdicao({ ...formEdicao, [field]: value });
  }

  function montarPayload() {
    const dados = {
      nomeCompleto: formEdicao.nomeCompleto,
      email: formEdicao.email,
      telefone: formEdicao.telefone,
    };
    if (ehAdmin) dados.nomeEmpresa = formEdicao.nomeEmpresa;
    return dados;
  }

  return (
    <Modal title={tr('Editar meus dados')} onClose={onClose}>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onSave(montarPayload())}>
          <div className="field">
            <label className="field__label" htmlFor="minha-conta-nome">{tr('Nome completo')}</label>
            <input
              id="minha-conta-nome"
              className="input"
              type="text"
              value={formEdicao.nomeCompleto}
              onChange={(e) => handleChangeEdicao('nomeCompleto', e.target.value)}
              required
            />
          </div>

          <div className="modal-form__row">
            <div className="field">
              <label className="field__label" htmlFor="minha-conta-email">{tr('E-mail')}</label>
              <input
                id="minha-conta-email"
                className="input"
                type="email"
                value={formEdicao.email}
                onChange={(e) => handleChangeEdicao('email', normalizarEmail(e.target.value))}
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="minha-conta-telefone">{tr('Telefone')}</label>
              <input
                id="minha-conta-telefone"
                className="input"
                type="text"
                value={formEdicao.telefone}
                onChange={(e) => handleChangeEdicao('telefone', e.target.value)}
              />
            </div>
          </div>

          {ehAdmin && (
            <fieldset className="modal-form__section">
              <legend>{tr('Dados da empresa')}</legend>

              <div className="field">
                <label className="field__label" htmlFor="minha-conta-empresa">{tr('Nome da empresa')}</label>
                <input
                  id="minha-conta-empresa"
                  className="input"
                  type="text"
                  value={formEdicao.nomeEmpresa}
                  onChange={(e) => handleChangeEdicao('nomeEmpresa', e.target.value)}
                  required
                />
              </div>
            </fieldset>
          )}
        </ModalForm>
      )}
    </Modal>
  );
}
