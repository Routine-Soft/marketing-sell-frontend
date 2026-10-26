import { Link } from 'react-router-dom'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useEnvioDeEmail } from '../envio.hooks'
import { cabemHoje, quantosVaoReceber, tempoEstimado } from '../envio.utils'
import { tr } from '@/i18n'
import './envio.css'

function Resumo({ previa, reenviar, onReenviar }) {
  if (!previa) {
    return <div className="skeleton envio-resumo__skeleton" aria-busy="true" aria-label={tr('Carregando')} />
  }

  const vao = quantosVaoReceber(previa, reenviar)
  const hoje = cabemHoje(previa.cota)

  return (
    <div className="envio-resumo">
      <div className="envio-resumo__total">
        <strong>{vao}</strong>
        <span>{vao === 1 ? tr('lead vai receber') : tr('leads vão receber')}</span>
      </div>

      <ul className="envio-resumo__detalhes">
        {previa.semEmail > 0 && (
          <li>{previa.semEmail === 1 ? tr('1 sem e-mail fica de fora') : tr('{n} sem e-mail ficam de fora', { n: previa.semEmail })}</li>
        )}
        {previa.jaRecebeu > 0 && (
          <li>{previa.jaRecebeu === 1 ? tr('1 já recebeu e-mail deste negócio') : tr('{n} já receberam e-mail deste negócio', { n: previa.jaRecebeu })}</li>
        )}
        <li>
          {tr('Gmail hoje: {usado} de {limite} usados', { usado: previa.cota.usado, limite: previa.cota.limite })}
          {previa.cota.naFila > 0 && ` · ${tr('{n} na fila', { n: previa.cota.naFila })}`}
        </li>
        {vao > 0 && <li>{tr('Sai um e-mail a cada 30 a 60 segundos: leva {tempo}.', { tempo: tempoEstimado(vao + previa.cota.naFila) })}</li>}
      </ul>

      {previa.jaRecebeu > 0 && (
        <label className="check">
          <input type="checkbox" checked={reenviar} onChange={(e) => onReenviar(e.target.checked)} />
          {tr('Mandar de novo para quem já recebeu')}
        </label>
      )}

      {vao > hoje && (
        <p className="alert alert--warning envio-resumo__aviso">
          {tr('Hoje ainda cabem {n} e-mails neste Gmail. Os outros esperam na fila e saem amanhã.', { n: hoje })}
        </p>
      )}
    </div>
  )
}

export default function EnviarEmailModal({ ids, onEnviado, onClose }) {
  const { remetentes, carregando, form, previa, erro, remetente, mudar, escolherRemetente, enviar } = useEnvioDeEmail(ids)
  const vao = quantosVaoReceber(previa, form.reenviar)

  async function handleSubmit() {
    const resposta = await enviar()
    if (resposta) onEnviado(resposta.message)
    return !!resposta
  }

  return (
    <Modal title={tr('Enviar e-mail')} onClose={onClose} wide>
      {(fechar) => {
        if (carregando) {
          return (
            <div className="envio-carregando" aria-busy="true" aria-label={tr('Carregando')}>
              {[0, 1, 2].map((i) => <div key={i} className="skeleton skeleton--line" style={{ height: 44 }} />)}
            </div>
          )
        }

        if (remetentes.length === 0) {
          return (
            <EstadoVazio
              icone={ICONES.email}
              titulo={tr('Nenhum remetente ativo')}
              texto={tr('Cadastre o Gmail e o texto do e-mail de cada negócio para poder enviar.')}
              acao={<Link className="btn btn--primary" to="/remetentes">{tr('Cadastrar remetente')}</Link>}
            />
          )
        }

        return (
          <ModalForm
            erro={erro}
            fechar={fechar}
            onSubmit={handleSubmit}
            submitDisabled={!previa || vao === 0}
            submitLabel={vao === 1 ? tr('Enviar para 1 lead') : tr('Enviar para {n} leads', { n: vao })}
            loadingLabel={tr('Colocando na fila...')}
          >
            <div className="field">
              <label className="field__label" htmlFor="envio-remetente">{tr('Remetente')}</label>
              <select id="envio-remetente" className="input" value={form.remetenteId} onChange={(e) => escolherRemetente(e.target.value)}>
                {remetentes.map((r) => (
                  <option key={r._id} value={r._id}>{r.nomeNegocio} · {r.email}</option>
                ))}
              </select>
            </div>

            <Resumo previa={previa} reenviar={form.reenviar} onReenviar={(valor) => mudar('reenviar', valor)} />

            <div className="field">
              <label className="field__label" htmlFor="envio-assunto">{tr('Assunto')}</label>
              <input id="envio-assunto" className="input" type="text" value={form.assunto}
                onChange={(e) => mudar('assunto', e.target.value)} required />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="envio-corpo">{tr('Texto do e-mail')}</label>
              <textarea id="envio-corpo" className="input textarea" rows={9} value={form.corpo}
                onChange={(e) => mudar('corpo', e.target.value)} required />
              <p className="field__hint">
                {tr('Use {nome}, {contato} e {cidade} para personalizar: viram os dados de cada lead. Mudar aqui vale só para este envio.')}
              </p>
            </div>

            {remetente?.rodape ? (
              <div className="envio-rodape">
                <span>{tr('Rodapé que vai no final')}</span>
                <p>{remetente.rodape}</p>
              </div>
            ) : (
              <p className="alert alert--warning">
                {tr('Este remetente está sem rodapé. A lei dos EUA (CAN-SPAM) pede endereço físico e um jeito de pedir para não receber mais. Dá para colocar em Remetentes.')}
              </p>
            )}
          </ModalForm>
        )
      }}
    </Modal>
  )
}
