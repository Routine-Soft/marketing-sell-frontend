import { diaDaData } from '@/components/Planilha/planilha.utils'
import { tr } from '@/i18n'

export const TIPOS_COMUNIDADE = [
    { valor: 'grupo', rotulo: tr('Grupo') },
    { valor: 'evento', rotulo: tr('Evento') },
    { valor: 'associacao', rotulo: tr('Associação / conselho') },
]

// Evento que acontece nos próximos 7 dias (fica amarelo, como na planilha).
export function eventoChegando(comunidade, hoje) {
    const dia = diaDaData(comunidade.dataEvento)
    if (!dia || dia < hoje) return false
    return (new Date(dia) - new Date(hoje)) / 86400000 <= 7
}
