import { useEffect, useState } from 'react'
import { useAuthContext } from '@/hooks/useAuthContext'
import { negocioAtual } from '@/modules/negocio/negocio.api'
import { NegocioContext } from './NegocioContext'

// Carrega o negócio aberto uma vez por sessão. As telas que mudam o negócio (nome, abas, rotina) avisam com
// trocarNegocio, e o menu e a Rotina se atualizam na hora.
export function NegocioProvider({ children }) {
    const { isAuthenticated, user } = useAuthContext()
    const [estado, setEstado] = useState({ negocio: null, erro: null, de: null })

    useEffect(() => {
        if (!isAuthenticated) return undefined
        let ignore = false
        negocioAtual()
            .then((r) => { if (!ignore) setEstado({ negocio: r.data, erro: null, de: user?._id }) })
            .catch((e) => { if (!ignore) setEstado({ negocio: null, erro: e, de: user?._id }) })
        return () => { ignore = true }
    }, [isAuthenticated, user?._id])

    const valor = {
        negocio: isAuthenticated && estado.de === user?._id ? estado.negocio : null,
        erro: estado.erro,
        trocarNegocio: (negocio) => setEstado((atual) => ({ ...atual, negocio })),
    }
    return <NegocioContext.Provider value={valor}>{children}</NegocioContext.Provider>
}

export default NegocioProvider
