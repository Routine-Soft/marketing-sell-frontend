import httpClient from '@/services/httpClient'

export const buscarOpcoes = () => httpClient.get('/captacao/opcoes')
export const fazerBusca = (dados) => httpClient.post('/captacao/buscas', dados)
export const buscarCnaes = (busca) => httpClient.get(`/captacao/cnaes?busca=${encodeURIComponent(busca)}`)
