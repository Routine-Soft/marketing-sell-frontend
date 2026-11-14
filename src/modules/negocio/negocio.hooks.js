import { useEffect, useState } from 'react'
import { useNegocio } from '@/hooks/useNegocio'
import { abrirSessaoDoNegocio } from './negocio.utils'
import {
    aplicarModelo, criarNegocio, editarNegocio, entrarNoNegocio, excluirModelo, excluirNegocio, listarModelos, listarNegocios, salvarComoModelo, salvarRotina,
} from './negocio.api'

// Tela de negócios: a lista, os modelos e as ações. Mudar o negócio aberto atualiza o menu na hora.
export function useNegocios() {
    const { trocarNegocio } = useNegocio()
    const [dados, setDados] = useState(null)
    const [modelos, setModelos] = useState(null)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)
    const [entrando, setEntrando] = useState('')

    useEffect(() => {
        let ignore = false
        Promise.all([listarNegocios(), listarModelos()])
            .then(([negocios, lista]) => { if (!ignore) { setDados(negocios.data); setModelos(lista.data) } })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [])

    async function executar(acao, depois) {
        setErro(null)
        setSucesso(null)
        try {
            const resposta = await acao()
            depois(resposta.data)
            setSucesso(resposta.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    const trocarNaLista = (novo) => {
        setDados((atual) => ({ ...atual, negocios: atual.negocios.map((n) => (n._id === novo._id ? novo : n)) }))
        if (novo._id === dados?.ativo) trocarNegocio(novo)
    }

    return {
        negocios: dados?.negocios ?? null,
        ativo: dados?.ativo,
        modelos,
        erro,
        sucesso,
        entrando,
        limparAvisos: () => { setErro(null); setSucesso(null) },
        criar: (campos) => executar(() => criarNegocio(campos), (novo) => setDados((atual) => ({ ...atual, negocios: [...atual.negocios, novo] }))),
        editar: (id, campos) => executar(() => editarNegocio(id, campos), trocarNaLista),
        excluir: (id) => executar(() => excluirNegocio(id), () => setDados((atual) => ({ ...atual, negocios: atual.negocios.filter((n) => n._id !== id) }))),
        salvarModelo: (campos) => executar(() => salvarComoModelo(campos), (novo) => setModelos((atual) => [...atual, novo])),
        excluirModelo: (id) => executar(() => excluirModelo(id), () => setModelos((atual) => atual.filter((m) => m.id !== id))),
        async entrar(id) {
            setEntrando(id)
            setErro(null)
            try {
                const resposta = await entrarNoNegocio(id)
                abrirSessaoDoNegocio(resposta.data)
            } catch (e) {
                setErro(e)
                setEntrando('')
            }
        },
    }
}

// Editar a rotina do negócio aberto: cada mudança é salva na hora (a rotina inteira vai junto).
export function useEditarRotina() {
    const { negocio, trocarNegocio } = useNegocio()
    const [modelos, setModelos] = useState(null)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)

    useEffect(() => {
        let ignore = false
        listarModelos()
            .then((r) => { if (!ignore) setModelos(r.data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [])

    async function salvar(rotina) {
        setErro(null)
        setSucesso(null)
        try {
            const resposta = await salvarRotina(rotina)
            trocarNegocio({ ...negocio, rotina: resposta.data })
            setSucesso(resposta.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return {
        rotina: negocio?.rotina ?? null,
        modelos,
        erro,
        sucesso,
        salvar,
        async aplicar(modeloId) {
            setErro(null)
            setSucesso(null)
            try {
                const resposta = await aplicarModelo(modeloId)
                trocarNegocio(resposta.data)
                setSucesso(resposta.message)
                return true
            } catch (e) {
                setErro(e)
                return false
            }
        },
    }
}
