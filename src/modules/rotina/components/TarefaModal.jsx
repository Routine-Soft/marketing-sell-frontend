import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { AUTOS, CONTAGENS, DIAS_UTEIS, TIPOS_DE_LINHA } from '../rotina.utils'
import { tr } from '@/i18n'

// Criar ou editar uma linha da rotina: tarefa, opcional ou automática.
export default function TarefaModal({ linha, blocos, blocoInicial, erro, onSalvar, onClose }) {
  const [form, setForm] = useState({
    bloco: linha?.bloco ?? blocoInicial ?? blocos[0]?.id ?? '',
    titulo: linha?.titulo ?? '',
    tipo: linha?.tipo ?? 'tarefa',
    meta: linha?.meta ?? '',
    auto: linha?.auto ?? '',
    contagem: linha?.contagem || CONTAGENS[0].valor,
    dias: linha?.dias?.length ? linha.dias : [],
  })
  const mudar = (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor }))
  const todoDia = form.dias.length === 0
  const alternarDia = (dia) => {
    const base = todoDia ? DIAS_UTEIS.map((d) => d.valor) : form.dias
    const novos = base.includes(dia) ? base.filter((d) => d !== dia) : [...base, dia].sort()
    mudar('dias', novos.length === DIAS_UTEIS.length ? [] : novos)
  }

  function enviar() {
    return onSalvar({
      ...form,
      meta: form.meta === '' ? null : Number(form.meta),
      auto: form.tipo === 'tarefa' ? form.auto : '',
      contagem: form.tipo === 'automatico' ? form.contagem : '',
    })
  }

  return (
    <Modal title={linha ? tr('Editar tarefa') : tr('Nova tarefa')} onClose={onClose} wide>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={enviar} submitDisabled={todoDia ? false : form.dias.length === 0}
          submitLabel={linha ? tr('Salvar alterações') : tr('Criar tarefa')}>
          <div className="field">
            <label className="field__label" htmlFor="tarefa-titulo">{tr('O que fazer')}</label>
            <input id="tarefa-titulo" className="input" value={form.titulo} onChange={(e) => mudar('titulo', e.target.value)}
              placeholder={tr('Ex.: Postar 1 vídeo no Instagram')} required maxLength={160} />
          </div>

          <div className="modal-form__row">
            <div className="field">
              <label className="field__label" htmlFor="tarefa-bloco">{tr('Bloco')}</label>
              <select id="tarefa-bloco" className="input" value={form.bloco} onChange={(e) => mudar('bloco', e.target.value)}>
                {blocos.map((bloco) => <option key={bloco.id} value={bloco.id}>{tr(bloco.nome)}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="tarefa-meta">{tr('Meta (opcional)')}</label>
              <input id="tarefa-meta" className="input" type="number" min="1" max="10000" inputMode="numeric" value={form.meta}
                onChange={(e) => mudar('meta', e.target.value)} placeholder={tr('Ex.: 30')} />
            </div>
          </div>

          <fieldset className="field">
            <legend className="field__label">{tr('Tipo')}</legend>
            <div className="tarefa-tipos">
              {TIPOS_DE_LINHA.map((tipo) => (
                <label key={tipo.valor} className="tarefa-tipo" data-escolhido={form.tipo === tipo.valor}>
                  <input type="radio" name="tipo" value={tipo.valor} checked={form.tipo === tipo.valor} onChange={() => mudar('tipo', tipo.valor)} />
                  <span><strong>{tipo.rotulo}</strong><small>{tipo.dica}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          {form.tipo === 'tarefa' && (
            <div className="field">
              <label className="field__label" htmlFor="tarefa-auto">{tr('Marcar sozinha quando')}</label>
              <select id="tarefa-auto" className="input" value={form.auto} onChange={(e) => mudar('auto', e.target.value)}>
                {AUTOS.map((auto) => <option key={auto.valor} value={auto.valor}>{auto.rotulo}</option>)}
              </select>
            </div>
          )}
          {form.tipo === 'automatico' && (
            <div className="field">
              <label className="field__label" htmlFor="tarefa-contagem">{tr('O que contar')}</label>
              <select id="tarefa-contagem" className="input" value={form.contagem} onChange={(e) => mudar('contagem', e.target.value)}>
                {CONTAGENS.map((contagem) => <option key={contagem.valor} value={contagem.valor}>{contagem.rotulo}</option>)}
              </select>
            </div>
          )}

          <fieldset className="field">
            <legend className="field__label">{tr('Dias')}</legend>
            <div className="check-list">
              {DIAS_UTEIS.map((dia) => (
                <label key={dia.valor} className="check">
                  <input type="checkbox" checked={todoDia || form.dias.includes(dia.valor)} onChange={() => alternarDia(dia.valor)} />
                  {dia.rotulo}
                </label>
              ))}
            </div>
            <p className="field__hint">{todoDia ? tr('Todo dia útil.') : tr('Nos outros dias a célula fica cinza.')}</p>
          </fieldset>
        </ModalForm>
      )}
    </Modal>
  )
}
