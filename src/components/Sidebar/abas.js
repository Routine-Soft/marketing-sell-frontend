import { tr } from '@/i18n'

// As abas da planilha no menu lateral, na ordem e nas cores das abas da planilha.
export const ABAS = [
    { id: 'rotina', label: tr('Rotina diária'), path: '/home', cor: 'var(--aba-rotina)' },
    { id: 'painel', label: tr('Painel'), path: '/painel', cor: 'var(--aba-painel)' },
    { id: 'leads', label: tr('Leads'), path: '/leads', cor: 'var(--aba-leads)' },
    { id: 'parceiros', label: tr('Parceiros'), path: '/parceiros', cor: 'var(--aba-parceiros)' },
    { id: 'preparacao', label: tr('Preparação'), path: '/preparacao', cor: 'var(--aba-preparacao)' },
    { id: 'comunidades', label: tr('Comunidades e eventos'), path: '/comunidades', cor: 'var(--aba-comunidades)' },
    { id: 'anuncios', label: tr('Anúncios (opcional)'), path: '/anuncios', cor: 'var(--aba-anuncios)' },
]

export function abaDoCaminho(caminho) {
    return ABAS.find((aba) => caminho.startsWith(aba.path))
}

// Abas que o negócio mostra no menu: a Rotina diária sempre, as outras conforme o negócio.
export function abasDoNegocio(negocio) {
    return ABAS.filter((aba) => aba.id === 'rotina' || negocio?.abas?.includes(aba.id))
}
