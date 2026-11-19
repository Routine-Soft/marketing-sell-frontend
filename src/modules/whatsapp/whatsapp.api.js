import httpClient from '@/services/httpClient'

// WhatsApp do negócio aberto e o envio automático para os leads.
export const getWhatsapp = () => httpClient.get('/whatsapp')
// Começa ou continua a conexão: devolve o QR Code enquanto o celular não lê.
export const conectarWhatsapp = () => httpClient.post('/whatsapp/conectar', {})
export const desconectarWhatsapp = () => httpClient.post('/whatsapp/desconectar', {})
export const salvarRegraWhatsapp = (regra) => httpClient.patch('/whatsapp', regra)
export const enviarTesteWhatsapp = (telefone) => httpClient.post('/whatsapp/teste', { telefone })
