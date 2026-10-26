import httpClient from '@/services/httpClient'

export const listarRemetentes = () => httpClient.get('/remetentes')
export const listarCotas = () => httpClient.get('/remetentes/cotas')
export const criarRemetente = (dados) => httpClient.post('/remetentes', dados)
export const editarRemetente = (id, dados) => httpClient.patch(`/remetentes/${id}`, dados)
export const excluirRemetente = (id) => httpClient.delete(`/remetentes/${id}`)
export const testarRemetente = (id, para) => httpClient.post(`/remetentes/${id}/teste`, para ? { para } : {})
