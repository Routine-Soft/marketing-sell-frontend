import httpClient from '@/services/httpClient'

export const parceiroApi = {
    listar: () => httpClient.get('/parceiros'),
    criar: (dados) => httpClient.post('/parceiros', dados),
    editar: (id, dados) => httpClient.patch(`/parceiros/${id}`, dados),
    excluir: (id) => httpClient.delete(`/parceiros/${id}`),
}
