import { tr } from '@/i18n'

// As abas da planilha no menu lateral, na ordem e nas cores das abas da planilha.
export const ABAS = [
    { label: tr('Rotina diária'), path: '/home', cor: 'var(--aba-rotina)' },
    { label: tr('Painel'), path: '/painel', cor: 'var(--aba-painel)' },
    { label: tr('Leads'), path: '/leads', cor: 'var(--aba-leads)' },
    { label: tr('Parceiros'), path: '/parceiros', cor: 'var(--aba-parceiros)' },
    { label: tr('Preparação'), path: '/preparacao', cor: 'var(--aba-preparacao)' },
    { label: tr('Comunidades e eventos'), path: '/comunidades', cor: 'var(--aba-comunidades)' },
    { label: tr('Anúncios (opcional)'), path: '/anuncios', cor: 'var(--aba-anuncios)' },
]

export function abaDoCaminho(caminho) {
    return ABAS.find((aba) => caminho.startsWith(aba.path))
}
