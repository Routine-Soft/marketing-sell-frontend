import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import { tr } from '@/i18n'

// Trocar a rotina do negócio aberto pela de um modelo.
export default function UsarModeloModal({ modelos, erro, onUsar, onClose }) {
  const [escolhido, setEscolhido] = useState(modelos?.[0]?.id ?? '')

  return (
    <Modal title={tr('Usar um modelo')} onClose={onClose} wide>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onUsar(escolhido)} submitDisabled={!escolhido} submitLabel={tr('Usar este modelo')}>
          <p className="alert alert--warning">{tr('A rotina e as abas deste negócio são trocadas pelas do modelo. O que já foi marcado nos dias e os leads continuam guardados.')}</p>
          <div className="negocio-modelos" role="radiogroup">
            {(modelos ?? []).map((modelo) => (
              <label key={modelo.id} className="negocio-modelo" data-escolhido={escolhido === modelo.id}>
                <input type="radio" name="modelo" value={modelo.id} checked={escolhido === modelo.id} onChange={() => setEscolhido(modelo.id)} />
                <span>
                  <strong>{tr(modelo.nome)}</strong>
                  {modelo.descricao && <small>{tr(modelo.descricao)}</small>}
                  <small className="negocio-modelo__numeros">{tr('{blocos} blocos · {tarefas} tarefas', { blocos: modelo.blocos, tarefas: modelo.tarefas })}</small>
                </span>
              </label>
            ))}
          </div>
        </ModalForm>
      )}
    </Modal>
  )
}
