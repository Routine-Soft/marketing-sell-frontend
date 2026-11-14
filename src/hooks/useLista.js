import { useEffect, useState } from 'react'

// Lista simples de uma aba (parceiros, comunidades, preparação): carrega tudo e salva linha a linha.
// api = { listar, criar, editar, excluir }, cada uma devolvendo a resposta padrão { data, message }.
export function useLista(api) {
    const [itens, setItens] = useState(null)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)

    useEffect(() => {
        let ignore = false
        api.listar()
            .then((r) => { if (!ignore) setItens(r.data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [api])

    async function executar(acao, depois, avisar = true) {
        setErro(null)
        setSucesso(null)
        try {
            const resposta = await acao()
            depois(resposta.data)
            if (avisar) setSucesso(resposta.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    const trocar = (id, novo) => setItens((atual) => atual.map((item) => (item._id === id ? novo : item)))

    return {
        itens,
        erro,
        sucesso,
        limparAvisos: () => { setErro(null); setSucesso(null) },
        criar: (dados) => executar(() => api.criar(dados), (novo) => setItens((atual) => [...atual, novo])),
        // Mudança de uma célula (caixinha, situação) não mostra aviso: a própria grade já muda.
        salvar: (id, campos) => executar(() => api.editar(id, campos), (novo) => trocar(id, novo), Object.keys(campos).length > 1),
        excluir: (id) => executar(() => api.excluir(id), () => setItens((atual) => atual.filter((item) => item._id !== id))),
    }
}
