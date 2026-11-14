import httpClient from '@/services/httpClient'

const apiDaLista = (lista) => ({
    listar: () => httpClient.get(`/checklists/${lista}`),
    criar: (dados) => httpClient.post(`/checklists/${lista}`, dados),
    editar: (id, dados) => httpClient.patch(`/checklists/itens/${id}`, dados),
    excluir: (id) => httpClient.delete(`/checklists/itens/${id}`),
})

export const preparacaoApi = apiDaLista('preparacao')
export const anunciosApi = apiDaLista('anuncios')
