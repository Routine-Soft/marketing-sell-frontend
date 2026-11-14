import { useEffect, useState } from 'react'
import { buscarCnaes, buscarOpcoes, fazerBusca } from './captacao.api'
import { editarNegocio } from '@/modules/negocio/negocio.api'
import { useNegocio } from '@/hooks/useNegocio'

export function useCaptacao() {
    const [opcoes, setOpcoes] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erroCarregar, setErroCarregar] = useState(null)
    const [buscando, setBuscando] = useState(false)
    const [erro, setErro] = useState(null)
    const [resultado, setResultado] = useState(null)

    useEffect(() => {
        let ignore = false
        buscarOpcoes()
            .then((op) => { if (!ignore) setOpcoes(op.data) })
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

    return { opcoes, carregando, erroCarregar, buscando, erro, resultado, buscar }
}

// Atividades (CNAE) que o negócio procura na fonte de CNPJs: a lista guardada no negócio e a busca pelo nome.
export function useAtividadesCnpj(iniciais) {
    const { negocio, trocarNegocio } = useNegocio()
    const [lista, setLista] = useState(iniciais)
    const [termo, setTermo] = useState('')
    const [achadas, setAchadas] = useState({ termo: '', itens: [] })
    const [erro, setErro] = useState(null)

    // Busca enquanto digita, com uma pausa curta para não pedir a cada letra.
    useEffect(() => {
        const limpo = termo.trim()
        if (limpo.length < 2) return undefined
        let ignore = false
        const timer = setTimeout(() => {
            buscarCnaes(limpo)
                .then((r) => { if (!ignore) setAchadas({ termo: limpo, itens: r.data }) })
                .catch((e) => { if (!ignore) setErro(e) })
        }, 300)
        return () => { ignore = true; clearTimeout(timer) }
    }, [termo])

    async function guardar(nova) {
        setErro(null)
        try {
            const resposta = await editarNegocio(negocio._id, { cnaesCnpj: nova.map((atividade) => atividade.codigo) })
            trocarNegocio(resposta.data)
            setLista(nova)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    const limpo = termo.trim()
    return {
        lista,
        termo,
        setTermo,
        achadas: limpo.length >= 2 && achadas.termo === limpo ? achadas.itens.filter((a) => !lista.some((b) => b.codigo === a.codigo)).slice(0, 10) : [],
        erro,
        adicionar: (atividade) => guardar([...lista, { ...atividade, naBase: false }]),
        remover: (codigo) => guardar(lista.filter((atividade) => atividade.codigo !== codigo)),
    }
}
