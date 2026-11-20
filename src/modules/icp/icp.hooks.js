import { useEffect, useState } from 'react'
import { icpApi } from './icp.api'

const trocar = (lista, novo) => lista.map((item) => (item._id === novo._id ? novo : item))

// ICPs e personas do negócio aberto. Excluir um ICP tira as personas dele da tela (o servidor apaga junto).
export function useIcps() {
    const [dados, setDados] = useState(null)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)

    useEffect(() => {
        let ignore = false
        icpApi.listar()
            .then((r) => { if (!ignore) setDados(r.data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [])

    async function executar(acao, depois) {
        setErro(null)
        setSucesso(null)
        try {
            const resposta = await acao()
            setDados((atual) => depois(atual, resposta.data))
            setSucesso(resposta.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return {
        icps: dados?.icps ?? null,
        personas: dados?.personas ?? [],
        erro,
        sucesso,
        limparAvisos: () => { setErro(null); setSucesso(null) },
        criarIcp: (form) => executar(() => icpApi.criarIcp(form), (d, novo) => ({ ...d, icps: [...d.icps, novo] })),
        salvarIcp: (id, form) => executar(() => icpApi.editarIcp(id, form), (d, novo) => ({ ...d, icps: trocar(d.icps, novo) })),
        excluirIcp: (id) => executar(() => icpApi.excluirIcp(id),
            (d) => ({ icps: d.icps.filter((icp) => icp._id !== id), personas: d.personas.filter((p) => p.icpId !== id) })),
        criarPersona: (form) => executar(() => icpApi.criarPersona(form), (d, nova) => ({ ...d, personas: [...d.personas, nova] })),
        salvarPersona: (id, form) => executar(() => icpApi.editarPersona(id, form), (d, nova) => ({ ...d, personas: trocar(d.personas, nova) })),
        excluirPersona: (id) => executar(() => icpApi.excluirPersona(id), (d) => ({ ...d, personas: d.personas.filter((p) => p._id !== id) })),
    }
}
