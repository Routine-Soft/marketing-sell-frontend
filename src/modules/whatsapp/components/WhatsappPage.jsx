import { useState } from 'react'
import { tr } from '@/i18n'
import { useNegocio } from '@/hooks/useNegocio'
import { STATUS, ROTULO_FONTE } from '@/modules/lead/lead.utils'
import { useWhatsapp } from '../whatsapp.hooks'
import {
  DIAS_DA_SEMANA, HORAS, VARIAVEIS, alternar, dataEHora, formatarNumeroWhatsapp, horaFormatada, horario, previaDaMensagem,
} from '../whatsapp.utils'
import './whatsapp.css'

function IconeWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8.5 9.5c0 3 3 6 6 6l1.5-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2z" />
    </svg>
  )
}

// Conexão do WhatsApp do negócio: desconectado (botão Conectar), conectando (QR Code) ou conectado (número).
function CartaoConexao({ situacao, conectando, ocupado, onConectar, onCancelar, onDesconectar }) {
  const [confirmando, setConfirmando] = useState(false)

  if (!situacao.disponivel) {
    return (
      <section className="card whats-card">
        <h3 className="whats-card__titulo">{tr('Conexão')}</h3>
        <p className="alert alert--info" role="status">{tr('O WhatsApp ainda não está disponível neste ambiente.')}</p>
      </section>
    )
  }

  if (situacao.conectado) {
    return (
      <section className="card whats-card whats-card--conectado">
        <div className="whats-conexao">
          <span className="whats-conexao__icone"><IconeWhatsapp /></span>
          <div className="whats-conexao__dados">
            <span className="badge badge--success">{tr('Conectado')}</span>
            <strong>{formatarNumeroWhatsapp(situacao.numero)}</strong>
            {situacao.nomePerfil && <span className="whats-texto-fraco">{situacao.nomePerfil}</span>}
          </div>
        </div>
        <p className="whats-card__texto">{tr('As mensagens saem deste número. As respostas dos leads chegam normalmente no seu WhatsApp.')}</p>
        {ocupado === 'desconectar' ? (
          <p className="whats-card__dica" role="status">{tr('Desconectando... isso leva alguns segundos.')}</p>
        ) : confirmando ? (
          <div className="whats-confirmar" role="group" aria-label={tr('Confirmar desconexão')}>
            <span>{tr('Desconectar?')}</span>
            <button type="button" className="btn btn--danger btn--sm" onClick={async () => { await onDesconectar(); setConfirmando(false) }} aria-label={tr('Sim, desconectar')}>✓</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmando(false)} aria-label={tr('Não desconectar')}>✗</button>
          </div>
        ) : (
          <button type="button" className="btn btn--ghost btn--sm whats-card__acao" onClick={() => setConfirmando(true)}>{tr('Desconectar')}</button>
        )}
      </section>
    )
  }

  if (conectando) {
    return (
      <section className="card whats-card">
        <h3 className="whats-card__titulo">{tr('Leia o QR Code com o celular')}</h3>
        <div className="whats-qr">
          <div className="whats-qr__imagem">
            {situacao.qrcode ? <img src={situacao.qrcode} alt={tr('QR Code para conectar o WhatsApp')} /> : <div className="skeleton whats-qr__carregando" />}
          </div>
          <ol className="whats-qr__passos">
            <li>{tr('Abra o WhatsApp no celular do negócio.')}</li>
            <li>{tr('Toque em Mais opções (⋮) ou Configurações e depois em Aparelhos conectados.')}</li>
            <li>{tr('Toque em Conectar um aparelho e aponte a câmera para este código.')}</li>
          </ol>
        </div>
        <p className="whats-card__dica">{tr('O código muda a cada poucos segundos. Esta tela avisa sozinha quando conectar.')}</p>
        <button type="button" className="btn btn--ghost btn--sm whats-card__acao" onClick={onCancelar}>{tr('Cancelar')}</button>
      </section>
    )
  }

  return (
    <section className="card whats-card whats-card--vazio">
      <span className="whats-conexao__icone whats-conexao__icone--apagado"><IconeWhatsapp /></span>
      <h3 className="whats-card__titulo">{tr('Conecte o WhatsApp do negócio')}</h3>
      <p className="whats-card__texto">{tr('As mensagens saem do seu próprio número. Para conectar, basta ler um QR Code com o celular, como no WhatsApp Web.')}</p>
      <button type="button" className="btn btn--primary" onClick={onConectar}>{tr('Conectar WhatsApp')}</button>
    </section>
  )
}

// Quantas saíram hoje, quando sai a próxima e o último problema da fila.
function CartaoHoje({ situacao }) {
  const { regra, enviadosHoje, naRegra, proximoEnvioEm, ultimoErro, ultimoErroEm } = situacao
  const porcentagem = Math.min(100, Math.round((enviadosHoje / regra.limiteDiario) * 100))
  const proximo = proximoEnvioEm && new Date(proximoEnvioEm) > new Date() ? horario(proximoEnvioEm) : null

  return (
    <section className="card whats-card">
      <div className="whats-card__cab">
        <h3 className="whats-card__titulo">{tr('Envios de hoje')}</h3>
        <span className={`badge ${regra.ativo ? 'badge--success' : 'badge--warning'}`}>{regra.ativo ? tr('Ligado') : tr('Desligado')}</span>
      </div>
      <div className="whats-uso">
        <div className="whats-uso__linha">
          <span>{tr('Mensagens enviadas hoje')}</span>
          <strong>{tr('{n} de {limite}', { n: enviadosHoje, limite: regra.limiteDiario })}</strong>
        </div>
        <div className="whats-uso__barra" role="progressbar" aria-valuemin={0} aria-valuemax={regra.limiteDiario} aria-valuenow={enviadosHoje} aria-label={tr('Mensagens enviadas hoje')}>
          <span style={{ width: `${porcentagem}%` }} />
        </div>
      </div>
      <ul className="whats-resumo">
        <li>{tr('{n} leads esperando pela mensagem (pela regra de agora)', { n: naRegra })}</li>
        <li>{tr('Horário: {inicio} às {fim} (Brasília)', { inicio: horaFormatada(regra.horaInicio), fim: horaFormatada(regra.horaFim) })}</li>
        {regra.ativo && proximo && <li>{tr('Próxima mensagem a partir de {hora}', { hora: proximo })}</li>}
      </ul>
      {ultimoErro && (
        <p className="alert alert--warning" role="status">{ultimoErro} <small className="whats-texto-fraco">({dataEHora(ultimoErroEm)})</small></p>
      )}
    </section>
  )
}

function Opcoes({ rotulo, opcoes, selecionadas, onMudar, dica }) {
  return (
    <fieldset className="field whats-opcoes">
      <legend className="field__label">{rotulo}</legend>
      <div className="whats-opcoes__lista">
        {opcoes.map(([valor, texto]) => (
          <button key={valor} type="button" className="whats-opcao" aria-pressed={selecionadas.includes(valor)} onClick={() => onMudar(alternar(selecionadas, valor))}>
            {texto}
          </button>
        ))}
      </div>
      {dica && <span className="field__hint">{dica}</span>}
    </fieldset>
  )
}

// A regra do envio automático: texto, para quem, quantos por dia, horário e dias.
function CartaoRegra({ situacao, ocupado, nomeNegocio, onSalvar }) {
  const [regra, setRegra] = useState(situacao.regra)
  const mudar = (campo, valor) => setRegra((atual) => ({ ...atual, [campo]: valor }))
  const alterado = JSON.stringify(regra) !== JSON.stringify(situacao.regra)
  const valida = regra.texto.trim() && regra.situacoes.length && regra.dias.length && regra.horaInicio < regra.horaFim
    && Number.isInteger(Number(regra.limiteDiario)) && Number(regra.limiteDiario) >= 1 && Number(regra.limiteDiario) <= 200

  function inserir(variavel) {
    mudar('texto', `${regra.texto}${regra.texto.endsWith(' ') || !regra.texto ? '' : ' '}{${variavel}}`)
  }

  return (
    <section className="card whats-card">
      <div className="whats-card__cab">
        <h3 className="whats-card__titulo">{tr('Envio automático')}</h3>
        <button type="button" role="switch" aria-checked={regra.ativo} className="switch" onClick={() => mudar('ativo', !regra.ativo)}>
          <span className="switch__track" />
          {regra.ativo ? tr('Ligado') : tr('Desligado')}
        </button>
      </div>
      <p className="whats-card__texto">{tr('Todo dia escolhido, o sistema manda a mensagem para os leads da regra, um de cada vez, espalhados no horário. Cada lead recebe uma vez só e passa a contar como contatado (com follow-up).')}</p>

      <div className="field">
        <label className="field__label" htmlFor="whats-texto">{tr('Mensagem')}</label>
        <textarea id="whats-texto" className="input textarea" rows={5} maxLength={1000} value={regra.texto} onChange={(e) => mudar('texto', e.target.value)} />
        <div className="whats-variaveis" aria-label={tr('Inserir no texto')}>
          {VARIAVEIS.map(([chave, rotulo]) => (
            <button key={chave} type="button" className="whats-variavel" onClick={() => inserir(chave)} title={rotulo}>{`{${chave}}`}</button>
          ))}
          {regra.texto !== situacao.textoPadrao && (
            <button type="button" className="whats-variavel whats-variavel--padrao" onClick={() => mudar('texto', situacao.textoPadrao)}>{tr('Usar o texto padrão')}</button>
          )}
        </div>
      </div>

      <div className="whats-previa" aria-label={tr('Prévia da mensagem')}>
        <span className="whats-previa__rotulo">{tr('Prévia')}</span>
        <p className="whats-previa__balao">{previaDaMensagem(regra.texto, nomeNegocio)}</p>
      </div>

      <Opcoes
        rotulo={tr('Para leads na situação')}
        opcoes={STATUS.map((s) => [s.valor, s.rotulo])}
        selecionadas={regra.situacoes}
        onMudar={(lista) => mudar('situacoes', lista)}
      />
      <Opcoes
        rotulo={tr('Só das fontes')}
        opcoes={Object.entries(ROTULO_FONTE)}
        selecionadas={regra.fontes}
        onMudar={(lista) => mudar('fontes', lista)}
        dica={tr('Nenhuma marcada = todas as fontes.')}
      />

      <div className="whats-linha">
        <div className="field">
          <label className="field__label" htmlFor="whats-limite">{tr('Quantos por dia')}</label>
          <input id="whats-limite" className="input" type="number" inputMode="numeric" min={1} max={200} value={regra.limiteDiario} onChange={(e) => mudar('limiteDiario', e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="whats-inicio">{tr('Das')}</label>
          <select id="whats-inicio" className="input" value={regra.horaInicio} onChange={(e) => mudar('horaInicio', Number(e.target.value))}>
            {HORAS.slice(0, 24).map((hora) => <option key={hora} value={hora}>{horaFormatada(hora)}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="whats-fim">{tr('Até')}</label>
          <select id="whats-fim" className="input" value={regra.horaFim} onChange={(e) => mudar('horaFim', Number(e.target.value))}>
            {HORAS.slice(1).map((hora) => <option key={hora} value={hora}>{horaFormatada(hora)}</option>)}
          </select>
        </div>
      </div>
      {regra.horaInicio >= regra.horaFim && <p className="alert alert--warning" role="status">{tr('O horário de início precisa ser antes do horário de fim')}</p>}

      <Opcoes
        rotulo={tr('Dias da semana')}
        opcoes={DIAS_DA_SEMANA}
        selecionadas={regra.dias}
        onMudar={(lista) => mudar('dias', lista)}
      />

      <button type="button" className="btn btn--primary whats-card__acao" disabled={!alterado || !valida || ocupado === 'salvar'} onClick={() => onSalvar({ ...regra, limiteDiario: Number(regra.limiteDiario) })}>
        {ocupado === 'salvar' ? tr('Salvando...') : tr('Salvar')}
      </button>
    </section>
  )
}

function CartaoTeste({ conectado, ocupado, onEnviar }) {
  const [telefone, setTelefone] = useState('')
  return (
    <section className="card whats-card">
      <h3 className="whats-card__titulo">{tr('Enviar um teste')}</h3>
      <p className="whats-card__texto">{tr('Manda a mensagem com um lead de exemplo para o número que você digitar.')}</p>
      <form className="whats-teste" onSubmit={(e) => { e.preventDefault(); onEnviar(telefone) }}>
        <input className="input" type="tel" inputMode="tel" placeholder="(11) 98765-4321" value={telefone} onChange={(e) => setTelefone(e.target.value)} aria-label={tr('Telefone para o teste')} />
        <button type="submit" className="btn btn--ghost" disabled={!conectado || !telefone.trim() || ocupado === 'teste'}>
          {ocupado === 'teste' ? tr('Enviando...') : tr('Enviar teste')}
        </button>
      </form>
      {!conectado && <p className="whats-card__dica">{tr('Conecte o WhatsApp para enviar o teste.')}</p>}
    </section>
  )
}

function UltimosEnvios({ envios }) {
  return (
    <section className="card whats-card whats-card--largo">
      <h3 className="whats-card__titulo">{tr('Últimos envios')}</h3>
      {envios.length === 0 ? (
        <div className="whats-vazio">
          <span className="whats-conexao__icone whats-conexao__icone--apagado"><IconeWhatsapp /></span>
          <p>{tr('Nenhuma mensagem enviada ainda. Ligue o envio automático e salve.')}</p>
        </div>
      ) : (
        <ul className="whats-envios">
          {envios.map((envio) => (
            <li key={envio._id} className="whats-envio">
              <div className="whats-envio__quem">
                <strong>{envio.nome}</strong>
                <span className="whats-texto-fraco">{formatarNumeroWhatsapp(envio.numero)} • {dataEHora(envio.em)}</span>
                {envio.erro && <span className="whats-envio__erro">{envio.erro}</span>}
              </div>
              <span className={`badge ${envio.status === 'enviado' ? 'badge--success' : 'badge--danger'}`}>
                {envio.teste ? tr('Teste') : envio.status === 'enviado' ? tr('Enviado') : tr('Falhou')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Tela do WhatsApp do negócio aberto: conexão do número, envio automático para os leads, teste e histórico.
export default function WhatsappPage() {
  const { negocio } = useNegocio()
  const { situacao, carregando, erro, mensagem, conectando, ocupado, conectar, cancelarConexao, desconectar, salvar, enviarTeste } = useWhatsapp()

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{tr('WhatsApp')}</h2>
          <p className="page-subtitle">{tr('Mensagens automáticas para os leads, pelo número do seu negócio')}</p>
        </div>
      </header>

      {(erro || mensagem) && (
        <div className="alerts">
          {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}
          {mensagem && <p className="alert alert--success" role="status">{mensagem === 'conectado' ? tr('WhatsApp conectado!') : mensagem}</p>}
        </div>
      )}

      {carregando ? (
        <div className="whats-grade" aria-busy="true">
          <div className="skeleton whats-skeleton" />
          <div className="skeleton whats-skeleton" />
        </div>
      ) : situacao && (
        <div className="whats-grade">
          <div className="whats-coluna">
            <CartaoConexao situacao={situacao} conectando={conectando} ocupado={ocupado} onConectar={conectar} onCancelar={cancelarConexao} onDesconectar={desconectar} />
            <CartaoHoje situacao={situacao} />
            <CartaoTeste conectado={situacao.conectado} ocupado={ocupado} onEnviar={enviarTeste} />
          </div>
          <CartaoRegra key={JSON.stringify(situacao.regra)} situacao={situacao} ocupado={ocupado} nomeNegocio={negocio?.nome} onSalvar={salvar} />
          <UltimosEnvios envios={situacao.ultimos} />
          <p className="whats-aviso">{tr('Use um número de WhatsApp só do negócio. O WhatsApp pode bloquear números que mandam muitas mensagens para quem não tem o número salvo: comece com poucas por dia e aumente aos poucos.')}</p>
        </div>
      )}
    </div>
  )
}
