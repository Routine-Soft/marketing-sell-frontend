import httpClient from '@/services/httpClient'

export const listarLeads = (query) => httpClient.get(`/leads?${query}`)
export const resumoDosLeads = () => httpClient.get('/leads/resumo')
export const exportarLeads = (query) => httpClient.get(`/leads/exportar?${query}`)
export const atualizarLead = (id, dados) => httpClient.patch(`/leads/${id}`, dados)
export const excluirLead = (id) => httpClient.delete(`/leads/${id}`)
export const excluirLeads = (ids) => httpClient.post('/leads/excluir', { ids })
export const procurarEmails = (ids) => httpClient.post('/leads/emails', { ids })
