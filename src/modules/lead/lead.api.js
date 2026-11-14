import httpClient from '@/services/httpClient'

export const listarLeads = (query) => httpClient.get(`/leads?${query}`)
export const resumoDosLeads = () => httpClient.get('/leads/resumo')
export const exportarLeads = (query) => httpClient.get(`/leads/exportar?${query}`)
export const atualizarLead = (id, dados) => httpClient.patch(`/leads/${id}`, dados)
export const excluirLead = (id) => httpClient.delete(`/leads/${id}`)
// selecao = { ids } (os escolhidos) ou { todos: true, filtros } (todos os da lista com os filtros da tela).
export const excluirLeads = (selecao) => httpClient.post('/leads/excluir', selecao)
export const procurarEmails = (selecao) => httpClient.post('/leads/emails', selecao)
export const registrarContato = (id, canal) => httpClient.post(`/leads/${id}/contatos`, { canal })
export const criarLead = (dados) => httpClient.post('/leads', dados)
