import { tr } from '@/i18n'

export const TIPOS_PARCEIRO = [
    { valor: 'contador', rotulo: tr('Contador') },
    { valor: 'influenciador', rotulo: tr('Influenciador') },
    { valor: 'vendedor', rotulo: tr('Vendedor autônomo') },
    { valor: 'outro', rotulo: tr('Outro') },
]

export const STATUS_PARCEIRO = [
    { valor: 'listado', rotulo: tr('Listado') },
    { valor: 'contatado', rotulo: tr('Contatado') },
    { valor: 'respondeu', rotulo: tr('Respondeu') },
    { valor: 'em_conversa', rotulo: tr('Em conversa') },
    { valor: 'parceiro_ativo', rotulo: tr('Parceiro ativo') },
    { valor: 'sem_interesse', rotulo: tr('Sem interesse') },
]
