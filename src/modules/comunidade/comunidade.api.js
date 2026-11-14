import httpClient from '@/services/httpClient'

export const comunidadeApi = {
    listar: () => httpClient.get('/comunidades'),
    criar: (dados) => httpClient.post('/comunidades', dados),
    editar: (id, dados) => httpClient.patch(`/comunidades/${id}`, dados),
    excluir: (id) => httpClient.delete(`/comunidades/${id}`),
}
