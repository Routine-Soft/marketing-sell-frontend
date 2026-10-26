import { useEffect, useState } from 'react'
import { atualizarLead, excluirLead, excluirLeads, exportarLeads, listarLeads, procurarEmails, resumoDosLeads } from './lead.api'
import { baixarArquivo, emAndamento, montarQuery } from './lead.utils'

const POR_PAGINA = 25
// Enquanto algum lead da página está na fila (procura de e-mail ou envio), a lista se atualiza sozinha.
const ATUALIZAR_FILA_MS = 5000

export function useLeads(filtros, pagina) {
    const [dados, setDados] = useState({ itens: [], total: 0 })
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)
    const [versao, setVersao] = useState(0)
    const [exportando, setExportando] = useState(false)

    const temNaFila = dados.itens.some(emAndamento)

    useEffect(() => {
        let ignore = false
        Promise.resolve()
            .then(() => {
                if (ignore) return null
                setCarregando(true)
                return listarLeads(montarQuery(filtros, pagina, POR_PAGINA))
            })
            .then((r) => { if (!ignore && r) { setDados(r.data); setErro(null) } })
            .catch((e) => { if (!ignore) setErro(e) })
            .finally(() => { if (!ignore) setCarregando(false) })
        return () => { ignore = true }
    }, [filtros, pagina, versao])

    useEffect(() => {
        if (!temNaFila) return undefined
        const timer = setInterval(() => {
            listarLeads(montarQuery(filtros, pagina, POR_PAGINA)).then((r) => setDados(r.data)).catch(() => {})
        }, ATUALIZAR_FILA_MS)
        return () => clearInterval(timer)
    }, [temNaFila, filtros, pagina])

    function recarregar() {
        setVersao((v) => v + 1)
    }

    async function executar(acao, depois) {
        setErro(null)
        setSucesso(null)
        try {
            const resposta = await acao()
            setSucesso(resposta.message)
            depois?.(resposta)
            return resposta
        } catch (e) {
            setErro(e)
        }
    }

    const trocarLead = (lead) => setDados((atual) => ({ ...atual, itens: atual.itens.map((l) => (l._id === lead._id ? lead : l)) }))

    return {
        ...dados,
        porPagina: POR_PAGINA,
        carregando,
        erro,
        sucesso,
        exportando,
        salvar: (id, campos) => executar(() => atualizarLead(id, campos), (r) => trocarLead(r.data)),
        excluir: (id) => executar(() => excluirLead(id), recarregar),
        excluirVarios: (ids) => executar(() => excluirLeads(ids), recarregar),
        procurarEmails: (ids) => executar(() => procurarEmails(ids), recarregar),
        depoisDoEnvio(mensagem) {
            setErro(null)
            setSucesso(mensagem)
            recarregar()
        },
        async exportar() {
            setExportando(true)
            setErro(null)
            try {
                const { data } = await exportarLeads(montarQuery(filtros))
                baixarArquivo(data.csv, data.nomeArquivo)
            } catch (e) {
                setErro(e)
            } finally {
                setExportando(false)
            }
        },
    }
}

export function useResumoDosLeads() {
    const [resumo, setResumo] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        resumoDosLeads()
            .then((r) => { if (!ignore) setResumo(r.data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [])

    return { resumo, erro }
}
