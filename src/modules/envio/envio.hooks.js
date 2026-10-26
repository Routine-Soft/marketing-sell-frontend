import { useEffect, useState } from 'react'
import { listarRemetentes } from '@/modules/remetente/remetente.api'
import { enviarEmails, previaDoEnvio } from './envio.api'

function textosDo(remetente) {
    return { remetenteId: remetente._id, assunto: remetente.assuntoPadrao, corpo: remetente.corpoPadrao, reenviar: false }
}

// `ids` precisa ser estável (guardado ao abrir a janela), senão a prévia é pedida de novo a cada render.
export function useEnvioDeEmail(ids) {
    const [remetentes, setRemetentes] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [form, setForm] = useState({ remetenteId: '', assunto: '', corpo: '', reenviar: false })
    const [previa, setPrevia] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ignore = false
        listarRemetentes()
            .then(({ data }) => {
                if (ignore) return
                const ativos = data.filter((r) => r.ativo)
                setRemetentes(ativos)
                if (ativos[0]) setForm(textosDo(ativos[0]))
            })
            .catch((e) => { if (!ignore) setErro(e) })
            .finally(() => { if (!ignore) setCarregando(false) })
        return () => { ignore = true }
    }, [])

    useEffect(() => {
        if (!form.remetenteId) return undefined
        let ignore = false
        previaDoEnvio({ remetenteId: form.remetenteId, ids })
            .then(({ data }) => { if (!ignore) setPrevia(data) })
            .catch((e) => { if (!ignore) setErro(e) })
        return () => { ignore = true }
    }, [form.remetenteId, ids])

    return {
        remetentes,
        carregando,
        form,
        previa,
        erro,
        remetente: remetentes.find((r) => r._id === form.remetenteId) ?? null,
        mudar: (campo, valor) => setForm((atual) => ({ ...atual, [campo]: valor })),
        // Trocar de negócio traz o assunto e o corpo padrão dele.
        escolherRemetente(id) {
            const escolhido = remetentes.find((r) => r._id === id)
            if (!escolhido) return
            setPrevia(null)
            setForm(textosDo(escolhido))
        },
        async enviar() {
            setErro(null)
            try {
                return await enviarEmails({ ...form, ids })
            } catch (e) {
                setErro(e)
            }
        },
    }
}
