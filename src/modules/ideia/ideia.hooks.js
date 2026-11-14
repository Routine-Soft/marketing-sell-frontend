import { useEffect, useState } from 'react'
import { ideiaApi } from './ideia.api'
import { hojeEmBrasilia, somarDias } from '@/modules/rotina/rotina.utils'

// Dias carregados de cada vez quando a pessoa rola até a ponta.
export const DIAS_POR_VEZ = 14

// Ideias de um período que cresce para o passado e para o futuro conforme a pessoa rola. Começa com duas semanas
// para trás e um mês para frente; as sem data vêm junto.
export function useIdeias(tipo) {
    const hoje = hojeEmBrasilia()
    const [periodo, setPeriodo] = useState(() => ({ de: somarDias(hoje, -DIAS_POR_VEZ), ate: somarDias(hoje, 2 * DIAS_POR_VEZ) }))
    const [ideias, setIdeias] = useState(null)
    // Começo do período das ideias que já chegaram (a tela usa para saber quando os dias novos carregaram).
    const [carregadoDe, setCarregadoDe] = useState(null)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)

    // Enquanto o período novo carrega, a tela continua mostrando o que já tinha.
    useEffect(() => {
        let ignore = false
        ideiaApi.listar(tipo, periodo.de, periodo.ate)
            .then((r) => { if (!ignore) { setIdeias(r.data); setCarregadoDe(periodo.de); setErro(null) } })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [tipo, periodo])

    async function executar(acao, depois, avisar = true) {
        setErro(null)
        setSucesso(null)
        try {
            const resposta = await acao()
            setIdeias((atual) => depois(atual, resposta.data))
            if (avisar) setSucesso(resposta.message)
            return true
        } catch (e) {
            setErro(e)
            return false
        }
    }

    return {
        hoje,
        periodo,
        ideias,
        carregadoDe,
        erro,
        sucesso,
        limparAvisos: () => { setErro(null); setSucesso(null) },
        maisPassado: () => setPeriodo((atual) => ({ ...atual, de: somarDias(atual.de, -DIAS_POR_VEZ) })),
        maisFuturo: () => setPeriodo((atual) => ({ ...atual, ate: somarDias(atual.ate, DIAS_POR_VEZ) })),
        criar: (dados) => executar(() => ideiaApi.criar({ ...dados, tipo }), (lista, nova) => [...lista, nova]),
        salvar: (id, campos) => executar(() => ideiaApi.editar(id, campos),
            (lista, nova) => lista.map((ideia) => (ideia._id === id ? nova : ideia)), Object.keys(campos).length > 1),
        excluir: (id) => executar(() => ideiaApi.excluir(id), (lista) => lista.filter((ideia) => ideia._id !== id)),
    }
}
