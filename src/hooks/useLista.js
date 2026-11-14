import { useEffect, useState } from 'react'

// Lista simples de uma aba (parceiros, comunidades, preparação): carrega tudo e salva linha a linha.
// api = { listar, criar, editar, excluir }, cada uma devolvendo a resposta padrão { data, message }.
export function useLista(api) {
    const [itens, setItens] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        api.listar()
            .then((r) => { if (!ignore) setItens(r.data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [api])

    async function executar(acao, depois) {
        setErro(null)
        try {
            const resposta = await acao()
            depois(resposta.data)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return {
        itens,
        erro,
        criar: (dados) => executar(() => api.criar(dados), (novo) => setItens((atual) => [...atual, novo])),
        salvar: (id, campos) => executar(() => api.editar(id, campos), (novo) => setItens((atual) => atual.map((item) => (item._id === id ? novo : item)))),
        excluir: (id) => executar(() => api.excluir(id), () => setItens((atual) => atual.filter((item) => item._id !== id))),
    }
}
