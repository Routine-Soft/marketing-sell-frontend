import { useEffect, useState } from 'react'
import { criarRemetente, editarRemetente, excluirRemetente, listarCotas, listarRemetentes, testarRemetente } from './remetente.api'
import { cancelarFila } from '@/modules/envio/envio.api'

export function useRemetentes() {
    const [remetentes, setRemetentes] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)

    useEffect(() => {
        let ignore = false
        listarRemetentes()
            .then(({ data }) => { if (!ignore) setRemetentes(data) })
            .catch((e) => { if (!ignore) setErro(e) })
            .finally(() => { if (!ignore) setCarregando(false) })
        return () => { ignore = true }
    }, [])

    async function executar(acao, depois) {
        setErro(null)
        setSucesso(null)
        try {
            const resposta = await acao()
            setSucesso(resposta.message)
            depois?.(resposta)
            return true
        } catch (e) {
            setErro(e)
        }
    }

    return {
        remetentes,
        carregando,
        erro,
        sucesso,
        criar: (dados) => executar(
            () => criarRemetente(dados),
            (r) => setRemetentes((atual) => [...atual, r.data]),
        ),
        editar: (id, dados) => executar(
            () => editarRemetente(id, dados),
            (r) => setRemetentes((atual) => atual.map((rem) => (rem._id === id ? r.data : rem))),
        ),
        excluir: (id) => executar(
            () => excluirRemetente(id),
            () => setRemetentes((atual) => atual.filter((rem) => rem._id !== id)),
        ),
        testar: (id, para) => executar(() => testarRemetente(id, para)),
        cancelarFila: (email) => executar(() => cancelarFila(email)),
    }
}

// Quantos e-mails já saíram hoje por Gmail (o limite de 500/dia é da conta do Gmail, não de um remetente só).
export function useCotasGmail() {
    const [cotas, setCotas] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [versao, setVersao] = useState(0)

    useEffect(() => {
        let ignore = false
        listarCotas()
            .then(({ data }) => { if (!ignore) setCotas(data) })
            .catch(() => {})
            .finally(() => { if (!ignore) setCarregando(false) })
        return () => { ignore = true }
    }, [versao])

    return { cotas, carregando, recarregar: () => setVersao((v) => v + 1) }
}
