import { useState } from 'react'
import httpClient from '@/services/httpClient'
import { loginUser, logoutUser, registrarConta } from '@/modules/user/user.api'

const CURRENT_USER_KEY = 'currentUser'

function lerUsuarioSalvo() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) ?? null
    } catch {
        return null
    }
}

export function useAuth() {
    const [user, setUser] = useState(lerUsuarioSalvo)
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = httpClient.tokenManager.getAccessToken()
        return !!token && !httpClient.tokenManager.isTokenExpired(token)
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function iniciarSessao({ accessToken, refreshToken, user: loggedUser }) {
        httpClient.tokenManager.setTokens(accessToken, refreshToken)
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedUser))
        setUser(loggedUser)
        setIsAuthenticated(true)
        return loggedUser
    }

    // Login e criação de conta devolvem a sessão já aberta.
    async function executar(acao) {
        setLoading(true)
        setError(null)
        try {
            const response = await acao()
            return iniciarSessao(response.data)
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const login = (email, password) => executar(() => loginUser({ email, password }))
    const registrar = (dados) => executar(() => registrarConta(dados))

    async function logout() {
        try {
            await logoutUser()
        } catch (err) {
            console.error('Erro ao fazer logout no backend:', err)
        } finally {
            httpClient.tokenManager.clearTokens()
            localStorage.removeItem(CURRENT_USER_KEY)
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    function atualizarUsuarioLogado(dados) {
        const atualizado = { ...user, ...dados }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(atualizado))
        setUser(atualizado)
    }

    function hasRole(role) {
        return user?.role === role
    }

    return { user, isAuthenticated, loading, error, login, registrar, logout, hasRole, atualizarUsuarioLogado }
}

export default useAuth
