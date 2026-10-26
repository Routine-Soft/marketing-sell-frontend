import httpClient from '@/services/httpClient'

export const loginUser = (credentials) => httpClient.post('/users/login', credentials)
export const registrarConta = (dados) => httpClient.post('/users', dados)
export const logoutUser = () => httpClient.post('/users/logout')
export const getMe = () => httpClient.get('/users/me')
export const updateMe = (dados) => httpClient.patch('/users/me', dados)
export const updateMyPassword = (dados) => httpClient.post('/users/me/password', dados)

// Super admin
export const listarContas = () => httpClient.get('/users/contas')
export const definirCota = (id, cota) => httpClient.patch(`/users/contas/${id}/cota`, { cota })
export const apagarConta = (id) => httpClient.delete(`/users/contas/${id}`)
