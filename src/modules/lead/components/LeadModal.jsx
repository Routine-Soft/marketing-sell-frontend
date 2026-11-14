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

const CAMPOS_VAZIOS = { nome: '', categoria: '', cidade: '', estado: '', telefone: '', email: '', instagram: '', origem: '', status: 'novo', observacao: '' }

// Adicionar um lead à mão (lead = null) ou ver os detalhes e editar um que já existe.
export default function LeadModal({ lead, erro, onCriar, onSalvar, onClose }) {
  const criando = !lead
  const [form, setForm] = useState(() => (criando ? CAMPOS_VAZIOS : Object.fromEntries(Object.keys(CAMPOS_VAZIOS).map((campo) => [campo, lead[campo] ?? '']))))
  const extras = Object.entries(lead?.extras ?? {}).filter(([, valor]) => valor !== null && valor !== '')
  const endereco = lead ? [lead.endereco, lead.cep].filter(Boolean).join(' · ') : ''
  const manual = criando || lead.fonte === 'manual'

  function mudar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function enviar() {
    // Lead que veio de uma fonte já tem a origem (a fonte): o campo só existe no cadastro à mão.
    const dados = manual ? form : Object.fromEntries(Object.entries(form).filter(([campo]) => campo !== 'origem'))
    return criando ? onCriar(dados) : onSalvar(lead._id, dados)
  }

  return (
    <Modal title={criando ? tr('Novo lead') : lead.nome} onClose={onClose} wide>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={enviar} submitLabel={criando ? tr('Adicionar') : tr('Salvar alterações')}>
          {!criando && (
            <dl className="lead-detalhes">
              {lead.contato && <div><dt>{tr('Contato')}</dt><dd>{lead.contato}</dd></div>}
              {endereco && <div className="lead-detalhes__largo"><dt>{tr('Endereço')}</dt><dd>{endereco}</dd></div>}
              {lead.site && (
                <div><dt>{tr('Site')}</dt><dd><a className="link" href={linkDoSite(lead.site)} target="_blank" rel="noreferrer">{siteSemProtocolo(lead.site)}</a></dd></div>
              )}
              <div><dt>{tr('Fonte')}</dt><dd>{ROTULO_FONTE[lead.fonte] ?? lead.fonte}</dd></div>
              <div><dt>{tr('Data cadastro')}</dt><dd>{formatarData(lead.createdAt)}</dd></div>
              {lead.ultimoEnvioEm && (
                <div><dt>{tr('Último e-mail')}</dt><dd>{formatarData(lead.ultimoEnvioEm)} · {lead.ultimoEnvioNegocio}</dd></div>
              )}
              {lead.numeroContatos > 0 && (
                <div><dt>{tr('Contatos feitos')}</dt><dd>{lead.numeroContatos} · {tr('último em {data}', { data: formatarData(lead.ultimoContatoEm) })}</dd></div>
              )}
              {lead.proximoFollowUpEm && (
                <div><dt>{tr('Próximo follow-up')}</dt><dd>{formatarData(lead.proximoFollowUpEm)}</dd></div>
              )}
              {lead.envioErro && (
                <div className="lead-detalhes__largo"><dt>{tr('Falha no último envio')}</dt><dd>{tr(lead.envioErro)}</dd></div>
              )}
              {extras.map(([chave, valor]) => (
                <div key={chave}><dt>{ROTULO_EXTRA[chave] ?? chave}</dt><dd>{valorDoExtra(chave, valor)}</dd></div>
              ))}
            </dl>
          )}

          <div className="item-form">
            <div className="field">
              <label className="field__label" htmlFor="lead-nome">{tr('Nome / Clínica')}</label>
              <input id="lead-nome" className="input" value={form.nome} onChange={(e) => mudar('nome', e.target.value)} required maxLength={200} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lead-categoria">{tr('Especialidade')}</label>
              <input id="lead-categoria" className="input" value={form.categoria} onChange={(e) => mudar('categoria', e.target.value)} placeholder={tr('Ex.: Psicologia')} maxLength={120} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lead-cidade">{tr('Cidade')}</label>
              <input id="lead-cidade" className="input" value={form.cidade} onChange={(e) => mudar('cidade', e.target.value)} maxLength={120} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lead-estado">{tr('UF')}</label>
              <input id="lead-estado" className="input" value={form.estado} onChange={(e) => mudar('estado', e.target.value.toUpperCase())} maxLength={2} placeholder="RJ" />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lead-telefone">{tr('Telefone')}</label>
              <input id="lead-telefone" className="input" type="tel" value={form.telefone} onChange={(e) => mudar('telefone', e.target.value)} maxLength={40} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lead-email">{tr('E-mail')}</label>
              <input id="lead-email" className="input" type="email" value={form.email} onChange={(e) => mudar('email', normalizarEmail(e.target.value))} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="lead-instagram">{tr('Instagram')}</label>
              <input id="lead-instagram" className="input" value={form.instagram} onChange={(e) => mudar('instagram', e.target.value)} placeholder="@" maxLength={120} />
            </div>
            {manual && (
              <div className="field">
                <label className="field__label" htmlFor="lead-origem">{tr('Origem')}</label>
                <input id="lead-origem" className="input" value={form.origem} onChange={(e) => mudar('origem', e.target.value)} placeholder={tr('Ex.: Instagram, Doctoralia, indicação')} maxLength={80} />
              </div>
            )}
            <div className="field">
              <label className="field__label" htmlFor="lead-status">{tr('Status')}</label>
              <select id="lead-status" className="input" value={form.status} onChange={(e) => mudar('status', e.target.value)}>
                {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
              </select>
            </div>
            <div className="field item-form__largo">
              <label className="field__label" htmlFor="lead-observacao">{tr('Observações')}</label>
              <textarea id="lead-observacao" className="input textarea" rows={3} value={form.observacao}
                onChange={(e) => mudar('observacao', e.target.value)} placeholder={tr('Ex.: ligar de novo na segunda')} maxLength={2000} />
            </div>
          </div>
        </ModalForm>
      )}
    </Modal>
  )
}
