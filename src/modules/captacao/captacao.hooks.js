import { useEffect, useState } from 'react'
import { buscarOpcoes, fazerBusca, listarBuscas } from './captacao.api'

export function useCaptacao() {
    const [opcoes, setOpcoes] = useState(null)
    const [historico, setHistorico] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erroCarregar, setErroCarregar] = useState(null)
    const [buscando, setBuscando] = useState(false)
    const [erro, setErro] = useState(null)
    const [resultado, setResultado] = useState(null)

    useEffect(() => {
        let ignore = false
        Promise.all([buscarOpcoes(), listarBuscas()])
            .then(([op, hist]) => {
                if (ignore) return
                setOpcoes(op.data)
                setHistorico(hist.data)
            })
            .catch((e) => { if (!ignore) setErroCarregar(e) })
            .finally(() => { if (!ignore) setCarregando(false) })
        return () => { ignore = true }
    }, [])

    async function buscar(fonte, filtros, buscarEmails) {
        setBuscando(true)
        setErro(null)
        setResultado(null)
        try {
            const resposta = await fazerBusca({ fonte, filtros, buscarEmails })
            const { busca } = resposta.data
            setResultado({ ...resposta.data, message: resposta.message })
            setHistorico((atual) => [busca, ...atual])
            if (busca.requisicoesGoogle) {
                setOpcoes((atual) => {
                    const usado = atual.cotaGoogle.usado + busca.requisicoesGoogle
                    return { ...atual, cotaGoogle: { ...atual.cotaGoogle, usado, restante: Math.max(0, atual.cotaGoogle.limite - usado) } }
                })
            }
        } catch (e) {
            setErro(e)
        } finally {
            setBuscando(false)
        }
    }

    return { opcoes, historico, carregando, erroCarregar, buscando, erro, resultado, buscar }
}
