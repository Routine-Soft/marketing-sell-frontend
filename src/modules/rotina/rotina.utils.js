import { localeAtual, tr } from '@/i18n'

export const DIAS_UTEIS = [
    { valor: 1, rotulo: tr('Seg') },
    { valor: 2, rotulo: tr('Ter') },
    { valor: 3, rotulo: tr('Qua') },
    { valor: 4, rotulo: tr('Qui') },
    { valor: 5, rotulo: tr('Sex') },
]

export const TIPOS_DE_LINHA = [
    { valor: 'tarefa', rotulo: tr('Tarefa'), dica: tr('Conta no % do dia.') },
    { valor: 'opcional', rotulo: tr('Opcional'), dica: tr('Canal ou detalhe que você marca, mas não conta no %.') },
    { valor: 'automatico', rotulo: tr('Automático'), dica: tr('Só mostra um número do dia, contado pelo sistema.') },
]

// "Marcar sozinha quando..." (tarefa) e "O que contar" (linha automática).
export const AUTOS = [
    { valor: '', rotulo: tr('Não: eu marco') },
    { valor: 'leads', rotulo: tr('Leads cadastrados no dia chegarem na meta') },
    { valor: 'primeirosContatos', rotulo: tr('Primeiros contatos do dia chegarem na meta') },
    { valor: 'parceiros', rotulo: tr('Parceiros cadastrados no dia chegarem na meta') },
    { valor: 'followUp', rotulo: tr('Não sobrar follow-up vencido') },
]

export const CONTAGENS = [
    { valor: 'leads', rotulo: tr('Leads cadastrados no dia') },
    { valor: 'primeirosContatos', rotulo: tr('Primeiros contatos no dia') },
    { valor: 'followUps', rotulo: tr('Follow-ups feitos no dia') },
    { valor: 'parceiros', rotulo: tr('Parceiros cadastrados no dia') },
]

export const CORES_DE_BLOCO = ['#2a7de1', '#19a568', '#e08a12', '#d9447f', '#7646d8', '#c2710c', '#1fa5b3', '#64748b']

// 'AAAA-MM-DD' somado em dias, sem depender do fuso do aparelho.
export function somarDias(dia, quantidade) {
    const data = new Date(`${dia}T12:00:00Z`)
    data.setUTCDate(data.getUTCDate() + quantidade)
    return data.toISOString().slice(0, 10)
}

// Hoje no dia de Brasília (o mesmo "dia" que o servidor usa).
export function hojeEmBrasilia() {
    return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function formatar(dia, opcoes) {
    return new Date(`${dia}T12:00:00Z`).toLocaleDateString(localeAtual(), { ...opcoes, timeZone: 'UTC' })
}

// "13/11" e "SEX.", como no cabeçalho da planilha.
export const diaCurto = (dia) => formatar(dia, { day: '2-digit', month: '2-digit' })
export const diaDaSemanaCurto = (dia) => formatar(dia, { weekday: 'short' }).replace('.', '').toUpperCase()
export const diaPorExtenso = (dia) => formatar(dia, { weekday: 'long', day: 'numeric', month: 'long' })

export function valeNoDia(linha, dia) {
    return !linha.dias?.length || linha.dias.includes(new Date(`${dia}T12:00:00Z`).getUTCDay())
}

export function frequenciaDe(linha) {
    if (linha.tipo === 'opcional') return tr('Opcional')
    if (linha.tipo === 'automatico') return tr('Automático')
    if (!linha.dias?.length) return tr('Diária')
    return linha.dias.map((dia) => DIAS_UTEIS[dia - 1]?.rotulo).join('/')
}

// Estado de uma célula da grade, pelas mesmas regras de cor da planilha:
// cinza = não precisa nesse dia; verde = feito; vermelho = dia que passou sem fazer (só a partir do dia em que
// a conta começou a usar a rotina: antes disso não há o que cobrar).
export function estadoDaCelula(linha, dia, hoje, inicio) {
    if (!valeNoDia(linha, dia.dia)) return 'inativo'
    const passou = dia.dia < hoje && dia.dia >= inicio
    if (linha.tipo === 'automatico') {
        if (!linha.meta) return ''
        if (dia.contagens[linha.contagem] + (dia.sobras?.[linha.contagem] ?? 0) >= linha.meta) return 'feito'
        return passou ? 'falta' : ''
    }
    if (dia.feitas.includes(linha.id)) return 'feito'
    return passou && linha.tipo === 'tarefa' ? 'falta' : ''
}

// Cor do % do dia: vermelho (0%) → amarelo (50%) → verde (100%).
export function corDoPercentual(percentual) {
    return percentual < 50
        ? `color-mix(in srgb, var(--plan-grad-1) ${percentual * 2}%, var(--plan-grad-0))`
        : `color-mix(in srgb, var(--plan-grad-2) ${(percentual - 50) * 2}%, var(--plan-grad-1))`
}

export function porcentagem(parte, total) {
    return total ? `${((parte / total) * 100).toLocaleString(localeAtual(), { maximumFractionDigits: 1 })}%` : '—'
}

// Troca o item de lugar com o vizinho (delta -1 = sobe, 1 = desce).
export function mover(lista, indice, delta) {
    const destino = indice + delta
    if (destino < 0 || destino >= lista.length) return lista
    const nova = [...lista]
    ;[nova[indice], nova[destino]] = [nova[destino], nova[indice]]
    return nova
}

// Linhas na ordem dos blocos (a grade mostra bloco por bloco).
export function linhasNaOrdemDosBlocos(blocos, linhas) {
    return blocos.flatMap((bloco) => linhas.filter((linha) => linha.bloco === bloco.id))
}

export function descricaoDoAuto(linha) {
    if (linha.tipo === 'automatico') return CONTAGENS.find((c) => c.valor === linha.contagem)?.rotulo ?? ''
    if (!linha.auto) return ''
    return AUTOS.find((a) => a.valor === linha.auto)?.rotulo ?? ''
}
