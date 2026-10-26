import httpClient from '@/services/httpClient'

export const previaDoEnvio = (dados) => httpClient.post('/envios/previa', dados)
export const enviarEmails = (dados) => httpClient.post('/envios', dados)
export const cancelarFila = (email) => httpClient.post('/envios/cancelar', { email })
