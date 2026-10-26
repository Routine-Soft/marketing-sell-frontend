import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import CampoSenha from '@/components/CampoSenha/CampoSenha'
import { normalizarEmail } from '@/utils/email'
import { tr } from '@/i18n'

export default function RemetenteModal({ remetente, erro, onSave, onClose }) {
  const editando = !!remetente
  const [form, setForm] = useState({
    nomeNegocio: remetente?.nomeNegocio ?? '',
    nomeExibicao: remetente?.nomeExibicao ?? '',
    email: remetente?.email ?? '',
    senhaApp: '',
    assuntoPadrao: remetente?.assuntoPadrao ?? '',
    corpoPadrao: remetente?.corpoPadrao ?? '',
    rodape: remetente?.rodape ?? '',
    ativo: remetente?.ativo ?? true,
  })

  function mudar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function montarPayload() {
    const dados = {
      nomeExibicao: form.nomeExibicao.trim() || form.nomeNegocio.trim(),
      email: form.email,
      assuntoPadrao: form.assuntoPadrao,
      corpoPadrao: form.corpoPadrao,
      rodape: form.rodape,
    }
    if (!editando) dados.nomeNegocio = form.nomeNegocio.trim()
    if (editando) dados.ativo = form.ativo
    if (form.senhaApp.trim()) dados.senhaApp = form.senhaApp.trim()
    return dados
  }

  return (
    <Modal title={editando ? tr('Editar remetente') : tr('Novo remetente')} onClose={onClose} wide>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onSave(montarPayload())}>
          <div className="modal-form__row">
            <div className="field">
              <label className="field__label" htmlFor="remetente-negocio">{tr('Negócio')}</label>
              <input
                id="remetente-negocio"
                className={`input${editando ? ' input--travado' : ''}`}
                type="text"
                {...(!editando ? { 'data-autofocus': true } : {})}
                value={form.nomeNegocio}
                onChange={(e) => mudar('nomeNegocio', e.target.value)}
                placeholder={tr('Ex.: Sonélia')}
                readOnly={editando}
                required
              />
              {editando && <p className="field__hint">{tr('O nome do negócio não pode ser alterado depois de criado.')}</p>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="remetente-exibicao">{tr('Nome do remetente (aparece no "De:")')}</label>
              <input
                id="remetente-exibicao"
                className="input"
                type="text"
                {...(editando ? { 'data-autofocus': true } : {})}
                value={form.nomeExibicao}
                onChange={(e) => mudar('nomeExibicao', e.target.value)}
                placeholder={form.nomeNegocio || tr('Ex.: Sonélia')}
              />
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="remetente-email">{tr('E-mail do Gmail')}</label>
            <input
              id="remetente-email"
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => mudar('email', normalizarEmail(e.target.value))}
              placeholder="stanleyclientes@gmail.com"
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="remetente-senha">{tr('Senha de app do Gmail')}</label>
            <CampoSenha
              id="remetente-senha"
              className="input"
              autoComplete="new-password"
              value={form.senhaApp}
              onChange={(e) => mudar('senhaApp', e.target.value)}
              placeholder={editando ? tr('Deixe em branco para manter a senha atual') : ''}
              required={!editando}
            />
            <p className="field__hint">
              {tr('Não é a senha normal da conta: é a senha de 16 letras gerada em myaccount.google.com/apppasswords, com a verificação em duas etapas ativada.')}
            </p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="remetente-assunto">{tr('Assunto padrão')}</label>
            <input
              id="remetente-assunto"
              className="input"
              type="text"
              value={form.assuntoPadrao}
              onChange={(e) => mudar('assuntoPadrao', e.target.value)}
              placeholder={tr('Ex.: Uma ideia para o seu site')}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="remetente-corpo">{tr('Corpo padrão')}</label>
            <textarea
              id="remetente-corpo"
              className="input textarea"
              rows={8}
              value={form.corpoPadrao}
              onChange={(e) => mudar('corpoPadrao', e.target.value)}
              placeholder={tr('Olá, {contato}! Vi a {nome} aqui em {cidade} e...')}
            />
            <p className="field__hint">
              {tr('Use {nome}, {contato} e {cidade} para personalizar: viram os dados de cada lead. Pode usar HTML simples, como <b>.')}
            </p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="remetente-rodape">{tr('Rodapé')}</label>
            <textarea
              id="remetente-rodape"
              className="input textarea"
              rows={3}
              value={form.rodape}
              onChange={(e) => mudar('rodape', e.target.value)}
              placeholder={tr('Ex.: Stanley Andrade · 123 Main St, Austin, TX 78701 · Se não quiser receber mais, é só responder "remover".')}
            />
            <p className="field__hint">
              {tr('Vai em letra pequena no fim de todo e-mail. A lei dos EUA (CAN-SPAM) pede endereço físico e um jeito de pedir para não receber mais.')}
            </p>
          </div>

          {editando && (
            <button
              type="button"
              role="switch"
              aria-checked={form.ativo}
              className="switch"
              onClick={() => mudar('ativo', !form.ativo)}
            >
              <span className="switch__track" aria-hidden="true" />
              {form.ativo ? tr('Remetente ativo') : tr('Remetente inativo')}
            </button>
          )}
        </ModalForm>
      )}
    </Modal>
  )
}
