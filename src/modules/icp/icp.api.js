import httpClient from '@/services/httpClient'

export const icpApi = {
    listar: () => httpClient.get('/icps'),
    criarIcp: (dados) => httpClient.post('/icps', dados),
    editarIcp: (id, dados) => httpClient.patch(`/icps/${id}`, dados),
    excluirIcp: (id) => httpClient.delete(`/icps/${id}`),
    criarPersona: (dados) => httpClient.post('/personas', dados),
    editarPersona: (id, dados) => httpClient.patch(`/personas/${id}`, dados),
    excluirPersona: (id) => httpClient.delete(`/personas/${id}`),
}
