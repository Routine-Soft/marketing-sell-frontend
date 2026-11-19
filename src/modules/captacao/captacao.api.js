import httpClient from '@/services/httpClient'

export const buscarOpcoes = () => httpClient.get('/captacao/opcoes')
export const fazerBusca = (dados) => httpClient.post('/captacao/buscas', dados)
