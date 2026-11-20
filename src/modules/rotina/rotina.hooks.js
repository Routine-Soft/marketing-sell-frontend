import { useEffect, useState } from 'react'
import { gradeDaRotina, marcarLinha, painelDaRotina } from './rotina.api'
import { somarDias } from './rotina.utils'

// A grade da rotina: dez dias úteis a partir de "de" (hoje, na abertura). Marcar muda a tela na hora e confirma no servidor.
export function useGradeDaRotina(de) {
    const [grade, setGrade] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        gradeDaRotina(de, somarDias(de, 13))
            .then((r) => { if (!ignore) { setGrade(r.data); setErro(null) } })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [de])

    const trocarDia = (novo) => setGrade((atual) => ({ ...atual, dias: atual.dias.map((dia) => (dia.dia === novo.dia ? novo : dia)) }))

    async function marcar(dia, linhaId, feita) {
        setErro(null)
        trocarDia({ ...dia, feitas: feita ? [...dia.feitas, linhaId] : dia.feitas.filter((id) => id !== linhaId) })
        try {
            const resposta = await marcarLinha(dia.dia, linhaId, feita)
            trocarDia(resposta.data)
        } catch (e) {
            trocarDia(dia)
            setErro(e)
        }
    }

    // Enquanto o período pedido não chega, a tela mostra o carregamento (e não o período anterior).
    return { grade: grade?.de === de ? grade : null, erro, marcar }
}

export function usePainel() {
    const [painel, setPainel] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        painelDaRotina()
            .then((r) => { if (!ignore) setPainel(r.data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [])

    return { painel, erro }
}
