import { localeAtual, tr } from '@/i18n'

export const BLOCOS = {
    leads: { nome: tr('1. Leads'), cor: '#2a7de1' },
    contato: { nome: tr('2. Contato'), cor: '#19a568' },
    follow_up: { nome: tr('3. Follow-up'), cor: '#e08a12' },
    video: { nome: tr('4. Vídeo'), cor: '#d9447f' },
    blog: { nome: tr('5. Blog'), cor: '#7646d8' },
    parceiros: { nome: tr('6. Parceiros'), cor: '#c2710c' },
    comunidades: { nome: tr('7. Comunidades'), cor: '#1fa5b3' },
    fechamento: { nome: tr('8. Fechamento'), cor: '#64748b' },
}

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

export function segundaDe(dia) {
    const diaDaSemana = new Date(`${dia}T12:00:00Z`).getUTCDay()
    return somarDias(dia, -((diaDaSemana + 6) % 7))
}

function formatar(dia, opcoes) {
    return new Date(`${dia}T12:00:00Z`).toLocaleDateString(localeAtual(), { ...opcoes, timeZone: 'UTC' })
}

// "13/11" e "SEX.", como no cabeçalho da planilha.
export const diaCurto = (dia) => formatar(dia, { day: '2-digit', month: '2-digit' })
export const diaDaSemanaCurto = (dia) => formatar(dia, { weekday: 'short' }).replace('.', '').toUpperCase()
export const diaPorExtenso = (dia) => formatar(dia, { weekday: 'long', day: 'numeric', month: 'long' })

export function valeNoDia(linha, dia) {
    return !linha.dias || linha.dias.includes(new Date(`${dia}T12:00:00Z`).getUTCDay())
}

export function frequenciaDe(linha) {
    if (linha.tipo === 'opcional') return tr('Opcional')
    if (linha.tipo === 'automatico') return tr('Automático')
    if (!linha.dias) return tr('Diária')
    return linha.dias.length === 1 ? tr('Sexta') : tr('Seg/Qua/Sex')
}

// Estado de uma célula da grade, pelas mesmas regras de cor da planilha:
// cinza = não precisa nesse dia; verde = feito; vermelho = dia que passou sem fazer (só a partir do dia em que
// a conta começou a usar a rotina: antes disso não há o que cobrar).
export function estadoDaCelula(linha, dia, hoje, inicio) {
    if (!valeNoDia(linha, dia.dia)) return 'inativo'
    const passou = dia.dia < hoje && dia.dia >= inicio
    if (linha.tipo === 'automatico') {
        if (!linha.meta) return ''
        if (dia.contagens[linha.contagem] >= linha.meta) return 'feito'
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
