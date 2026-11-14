import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { ABAS_OPCIONAIS } from '../negocio.utils'
import { tr } from '@/i18n'

// Criar um negócio (com o modelo de rotina) ou mudar nome, site e abas de um que já existe.
export default function NegocioModal({ negocio, modelos, erro, onSalvar, onClose }) {
  const criando = !negocio
  const [form, setForm] = useState({
    nome: negocio?.nome ?? '',
    site: negocio?.site ?? '',
    abas: negocio?.abas ?? [],
    modeloId: modelos?.[0]?.id ?? '',
  })
  const mudar = (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor }))
  const alternarAba = (aba) => mudar('abas', form.abas.includes(aba) ? form.abas.filter((a) => a !== aba) : [...form.abas, aba])

  function enviar() {
    const { modeloId, abas, ...resto } = form
    return onSalvar(criando ? { ...resto, modeloId } : { ...resto, abas })
  }

  return (
    <Modal title={criando ? tr('Novo negócio') : tr('Editar negócio')} onClose={onClose} wide={criando}>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={enviar} submitLabel={criando ? tr('Criar negócio') : tr('Salvar alterações')}>
          <div className="modal-form__row">
            <div className="field">
              <label className="field__label" htmlFor="negocio-nome">{tr('Nome do negócio')}</label>
              <input id="negocio-nome" className="input" value={form.nome} onChange={(e) => mudar('nome', e.target.value)} placeholder={tr('Ex.: Sonélia')} required maxLength={80} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="negocio-site">{tr('Site (opcional)')}</label>
              <input id="negocio-site" className="input" value={form.site} onChange={(e) => mudar('site', e.target.value)} placeholder="sonelia.com.br" maxLength={200} />
            </div>
          </div>

          {criando ? (
            <fieldset className="modal-form__section">
              <legend>{tr('Modelo de rotina')}</legend>
              <p className="modal-form__hint">{tr('O negócio começa com a rotina, as abas e as listas do modelo. Depois dá para mudar tudo.')}</p>
              <div className="negocio-modelos" role="radiogroup">
                {(modelos ?? []).map((modelo) => (
                  <label key={modelo.id} className="negocio-modelo" data-escolhido={form.modeloId === modelo.id}>
                    <input type="radio" name="modelo" value={modelo.id} checked={form.modeloId === modelo.id} onChange={() => mudar('modeloId', modelo.id)} />
                    <span>
                      <strong>{tr(modelo.nome)}</strong>
                      {modelo.descricao && <small>{tr(modelo.descricao)}</small>}
                      <small className="negocio-modelo__numeros">
                        {tr('{blocos} blocos · {tarefas} tarefas', { blocos: modelo.blocos, tarefas: modelo.tarefas })}
                        {modelo.proprio && ` · ${tr('seu modelo')}`}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <fieldset className="modal-form__section">
              <legend>{tr('Abas no menu')}</legend>
              <p className="modal-form__hint">{tr('A Rotina diária aparece sempre. Escolha as outras.')}</p>
              <div className="check-list">
                {ABAS_OPCIONAIS.map((aba) => (
                  <label key={aba.valor} className="check">
                    <input type="checkbox" checked={form.abas.includes(aba.valor)} onChange={() => alternarAba(aba.valor)} />
                    {aba.rotulo}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </ModalForm>
      )}
    </Modal>
  )
}
