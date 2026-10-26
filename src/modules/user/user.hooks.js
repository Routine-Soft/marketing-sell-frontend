import { useEffect, useState } from 'react'
import { useAuthContext } from '@/hooks/useAuthContext'
import { getMe, updateMe, updateMyPassword, listarContas, definirCota, apagarConta } from './user.api'

export function useMinhaConta() {
    const { atualizarUsuarioLogado } = useAuthContext()
    const [perfil, setPerfil] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    useEffect(() => {
        let ignore = false
        getMe()
            .then(({ data }) => { if (!ignore) setPerfil(data) })
            .catch((err) => { if (!ignore) setError(err) })
            .finally(() => { if (!ignore) setLoading(false) })
        return () => { ignore = true }
    }, [])

    async function salvarPerfil(dados) {
        setError(null)
        try {
            const response = await updateMe(dados)
            setPerfil(response.data)
            atualizarUsuarioLogado(response.data)
            setSuccessMessage(response.message)
            return response.data
        } catch (err) {
            setError(err)
        }
    }

    async function alterarSenha(dados) {
        setError(null)
        try {
            const response = await updateMyPassword(dados)
            setSuccessMessage(response.message)
            return true
        } catch (err) {
            setError(err)
        }
    }

    return { perfil, loading, error, successMessage, salvarPerfil, alterarSenha }
}

// Painel do super admin: contas da plataforma, cota do Google e exclusão.
export function useContasAdmin() {
    const [dados, setDados] = useState({ contas: [], cotaPadrao: 0 })
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(null)

    useEffect(() => {
        let ignore = false
        listarContas()
            .then(({ data }) => { if (!ignore) setDados(data) })
            .catch((err) => { if (!ignore) setErro(err) })
            .finally(() => { if (!ignore) setLoading(false) })
        return () => { ignore = true }
    }, [])

    async function salvarCota(id, cota) {
        setErro(null)
        try {
            const resposta = await definirCota(id, cota)
            setDados((atual) => ({
                ...atual,
                contas: atual.contas.map((c) => (c._id === id
                    ? { ...c, cotaGoogleMensal: resposta.data.cotaGoogleMensal, cotaGoogle: resposta.data.cotaGoogleMensal ?? atual.cotaPadrao }
                    : c)),
            }))
            setSucesso(resposta.message)
            return true
        } catch (err) {
            setErro(err)
        }
    }

    async function excluir(id) {
        setErro(null)
        try {
            const resposta = await apagarConta(id)
            setDados((atual) => ({ ...atual, contas: atual.contas.filter((c) => c._id !== id) }))
            setSucesso(resposta.message)
        } catch (err) {
            setErro(err)
        }
    }

    return { ...dados, loading, erro, sucesso, salvarCota, excluir }
}
