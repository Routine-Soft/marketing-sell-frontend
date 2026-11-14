import { createContext } from 'react'

// Negócio aberto agora: { negocio, carregando, erro, trocarNegocio(novo) }.
export const NegocioContext = createContext(null)
