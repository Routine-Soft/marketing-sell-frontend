import httpClient from '@/services/httpClient'

export const negocioAtual = () => httpClient.get('/negocios/atual')
export const listarNegocios = () => httpClient.get('/negocios')
export const criarNegocio = (dados) => httpClient.post('/negocios', dados)
export const editarNegocio = (id, dados) => httpClient.patch(`/negocios/${id}`, dados)
export const excluirNegocio = (id) => httpClient.delete(`/negocios/${id}`)
export const entrarNoNegocio = (id) => httpClient.post(`/negocios/${id}/entrar`, {})
export const salvarRotina = (rotina) => httpClient.put('/negocios/atual/rotina', rotina)
export const aplicarModelo = (modeloId) => httpClient.post('/negocios/atual/modelo', { modeloId })

export const listarModelos = () => httpClient.get('/modelos')
export const salvarComoModelo = (dados) => httpClient.post('/modelos', dados)
export const excluirModelo = (id) => httpClient.delete(`/modelos/${id}`)
