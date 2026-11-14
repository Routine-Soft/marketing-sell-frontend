import httpClient from '@/services/httpClient'

export const ideiaApi = {
    listar: (tipo, de, ate) => httpClient.get(`/ideias?tipo=${tipo}&de=${de}&ate=${ate}`),
    criar: (dados) => httpClient.post('/ideias', dados),
    editar: (id, dados) => httpClient.patch(`/ideias/${id}`, dados),
    excluir: (id) => httpClient.delete(`/ideias/${id}`),
}
