import { localeAtual } from '@/i18n'

// Data do servidor → 'AAAA-MM-DD' no dia de Brasília (o valor do campo de data).
export function diaDaData(valor) {
    if (!valor) return ''
    // Já é um dia ('AAAA-MM-DD'): não passa pelo fuso.
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor
    return new Date(new Date(valor).getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

// "13/11/2026", sem depender do fuso do aparelho.
export function dataCurta(valor) {
    const dia = diaDaData(valor)
    return dia ? new Date(`${dia}T12:00:00Z`).toLocaleDateString(localeAtual(), { timeZone: 'UTC' }) : ''
}

export function comProtocolo(link) {
    return /^https?:\/\//i.test(link) ? link : `https://${link}`
}

export function semProtocolo(link) {
    return link.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
}

export function textoDaOpcao(opcoes, valor) {
    return opcoes.find((opcao) => opcao.valor === valor)?.rotulo ?? ''
}
