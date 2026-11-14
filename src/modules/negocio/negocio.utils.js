import httpClient from '@/services/httpClient'
import { tr } from '@/i18n'

// Abas que cada negócio pode mostrar ou esconder (a Rotina diária aparece sempre).
export const ABAS_OPCIONAIS = [
    { valor: 'painel', rotulo: tr('Painel') },
    { valor: 'leads', rotulo: tr('Leads') },
    { valor: 'parceiros', rotulo: tr('Parceiros') },
    { valor: 'preparacao', rotulo: tr('Preparação') },
    { valor: 'comunidades', rotulo: tr('Comunidades e eventos') },
    { valor: 'anuncios', rotulo: tr('Anúncios (opcional)') },
]

// Abre o negócio escolhido: guarda a sessão nova (o token leva o negócio) e recarrega na Rotina diária,
// para nenhuma tela ficar com dados do negócio anterior.
export function abrirSessaoDoNegocio({ accessToken, refreshToken }) {
    httpClient.tokenManager.setTokens(accessToken, refreshToken)
    window.location.hash = '#/home'
    window.location.reload()
}
