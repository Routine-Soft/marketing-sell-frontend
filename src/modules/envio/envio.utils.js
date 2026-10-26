import { tr } from '@/i18n'

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
