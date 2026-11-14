import { useContext } from 'react'
import { NegocioContext } from '@/context/NegocioContext'

export function useNegocio() {
    const contexto = useContext(NegocioContext)
    if (!contexto) throw new Error('useNegocio deve ser usado dentro de NegocioProvider')
    return contexto
}
