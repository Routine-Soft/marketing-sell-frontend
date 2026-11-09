import { tr, localeAtual } from '@/i18n'

// A fila manda um e-mail a cada 30 a 60 segundos por Gmail: em média 45.
const SEGUNDOS_POR_EMAIL = 45

export function quantosVaoReceber(previa, reenviar) {
    if (!previa) return 0
    return reenviar ? previa.comEmail : previa.comEmail - previa.jaRecebeu
}

// Quantos ainda saem hoje, contando o que já está na fila na frente.
export function cabemHoje(cota) {
    return Math.max(0, cota.restante - cota.naFila)
}

export function tempoEstimado(quantidade) {
    const minutos = Math.max(1, Math.round((quantidade * SEGUNDOS_POR_EMAIL) / 60))
    if (minutos < 60) return minutos === 1 ? tr('cerca de 1 minuto') : tr('cerca de {n} minutos', { n: minutos })
    const horas = Math.round(minutos / 60)
    return horas === 1 ? tr('cerca de 1 hora') : tr('cerca de {n} horas', { n: horas })
}

function dataHora(data) {
  return new Date(data).toLocaleString(localeAtual(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// Aviso quando o próprio Gmail recusou por limite: a fila daquele Gmail fica parada até `pausadoAte`.
export function textoDaPausa(cota) {
  if (!cota?.pausadoAte) return ''
  return tr('O Gmail recusou novos envios por limite de envio em {em}. A fila volta sozinha em {ate}.', {
    em: dataHora(cota.pausadoEm),
    ate: dataHora(cota.pausadoAte),
  })
}
