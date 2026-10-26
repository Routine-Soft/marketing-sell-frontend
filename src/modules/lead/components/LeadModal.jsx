import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { normalizarEmail } from '@/utils/email'
import { formatarData } from '@/modules/captacao/captacao.utils'
import { ROTULO_EXTRA, ROTULO_FONTE, STATUS, linkDoSite, siteSemProtocolo } from '../lead.utils'
import { tr } from '@/i18n'

function valorDoExtra(chave, valor) {
  if (['desde', 'abertura'].includes(chave)) return formatarData(valor)
  if (chave === 'tipo') return valor === 'empresa' ? tr('Clínica') : tr('Profissional')
  return String(valor)
}

// Detalhes do lead e o que a equipe pode mudar: situação, telefone, e-mail e observação.
export default function LeadModal({ lead, erro, onSalvar, onClose }) {
  const [form, setForm] = useState({
    status: lead.status,
    telefone: lead.telefone,
    email: lead.email,
    observacao: lead.observacao,
  })
  const extras = Object.entries(lead.extras ?? {}).filter(([, valor]) => valor !== null && valor !== '')
  const endereco = [lead.endereco, [lead.cidade, lead.estado].filter(Boolean).join(', '), lead.cep].filter(Boolean).join(' · ')

  function mudar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  return (
    <Modal title={lead.nome} onClose={onClose} wide>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onSalvar(lead._id, form)}>
          <dl className="lead-detalhes">
            {lead.contato && <div><dt>{tr('Contato')}</dt><dd>{lead.contato}</dd></div>}
            {lead.categoria && <div><dt>{tr('Categoria')}</dt><dd>{lead.categoria}</dd></div>}
            {endereco && <div className="lead-detalhes__largo"><dt>{tr('Endereço')}</dt><dd>{endereco}</dd></div>}
            {lead.site && (
              <div><dt>{tr('Site')}</dt><dd><a className="link" href={linkDoSite(lead.site)} target="_blank" rel="noreferrer">{siteSemProtocolo(lead.site)}</a></dd></div>
            )}
            <div><dt>{tr('Fonte')}</dt><dd>{ROTULO_FONTE[lead.fonte] ?? lead.fonte}</dd></div>
            {lead.ultimoEnvioEm && (
              <div><dt>{tr('Último e-mail')}</dt><dd>{formatarData(lead.ultimoEnvioEm)} · {lead.ultimoEnvioNegocio}</dd></div>
            )}
            {lead.envioErro && (
              <div className="lead-detalhes__largo"><dt>{tr('Falha no último envio')}</dt><dd>{tr(lead.envioErro)}</dd></div>
            )}
            {extras.map(([chave, valor]) => (
              <div key={chave}><dt>{ROTULO_EXTRA[chave] ?? chave}</dt><dd>{valorDoExtra(chave, valor)}</dd></div>
            ))}
          </dl>

          <div className="modal-form__row">
            <div className="field">
              <label className="field__label" htmlFor="lead-telefone">{tr('Telefone')}</label>
              <input id="lead-telefone" className="input" type="tel" value={form.telefone} onChange={(e) => mudar('telefone', e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lead-email">{tr('E-mail')}</label>
              <input id="lead-email" className="input" type="email" value={form.email} onChange={(e) => mudar('email', normalizarEmail(e.target.value))} />
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="lead-status">{tr('Situação')}</label>
            <select id="lead-status" className="input" value={form.status} onChange={(e) => mudar('status', e.target.value)}>
              {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="lead-observacao">{tr('Observação')}</label>
            <textarea id="lead-observacao" className="input textarea" rows={3} value={form.observacao}
              onChange={(e) => mudar('observacao', e.target.value)} placeholder={tr('Ex.: ligar de novo na segunda')} />
          </div>
        </ModalForm>
      )}
    </Modal>
  )
}
