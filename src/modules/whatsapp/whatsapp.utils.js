import { tr } from '@/i18n'

// Variáveis do texto (as mesmas de whatsapp.texto.js no backend) e o lead de exemplo da prévia.
export const VARIAVEIS = [
  ['contato', tr('Primeiro nome da pessoa (sem ela, o nome da empresa)')],
  ['nome', tr('Nome da empresa')],
  ['cidade', tr('Cidade')],
  ['negocio', tr('Nome do seu negócio')],
]

const EXEMPLO = { nome: 'Clínica Bem Estar', contato: 'Maria', cidade: 'São Paulo' }

export function previaDaMensagem(texto, nomeNegocio) {
  const valores = { ...EXEMPLO, negocio: nomeNegocio ?? '' }
  return String(texto ?? '').replace(/\{(\w+)\}/g, (trecho, nome) => (nome in valores ? valores[nome] : trecho))
}

// 0 = domingo, como no backend.
export const DIAS_DA_SEMANA = [
  [1, tr('Seg')], [2, tr('Ter')], [3, tr('Qua')], [4, tr('Qui')], [5, tr('Sex')], [6, tr('Sáb')], [0, tr('Dom')],
]

export const HORAS = Array.from({ length: 25 }, (_, hora) => hora)
export const horaFormatada = (hora) => `${String(hora).padStart(2, '0')}:00`

// "5521992002356" -> "+55 21 99200-2356" (só para mostrar).
export function formatarNumeroWhatsapp(numero) {
  const d = String(numero ?? '').replace(/\D/g, '')
  const br = d.match(/^55(\d{2})(\d{4,5})(\d{4})$/)
  return br ? `+55 ${br[1]} ${br[2]}-${br[3]}` : d ? `+${d}` : ''
}

export function horario(data) {
  return data ? new Date(data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
}

export function dataEHora(data) {
  return data ? new Date(data).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
}

// Liga ou desliga um item numa lista (situações, fontes, dias).
export function alternar(lista, item) {
  return lista.includes(item) ? lista.filter((atual) => atual !== item) : [...lista, item]
}
