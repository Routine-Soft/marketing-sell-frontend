import httpClient from '@/services/httpClient'

export const gradeDaRotina = (de, ate) => httpClient.get(`/rotina/grade?de=${de}&ate=${ate}`)
export const marcarLinha = (dia, linhaId, feita) => httpClient.patch(`/rotina/${dia}`, { linhaId, feita })
export const painelDaRotina = () => httpClient.get('/rotina/painel')
