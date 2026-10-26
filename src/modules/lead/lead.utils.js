import { tr } from '@/i18n'

export const STATUS = [
    { valor: 'novo', rotulo: tr('Novo'), tom: 'info' },
    { valor: 'contatado', rotulo: tr('Contatado'), tom: 'warning' },
    { valor: 'interessado', rotulo: tr('Interessado'), tom: 'primary' },
    { valor: 'cliente', rotulo: tr('Cliente'), tom: 'success' },
    { valor: 'descartado', rotulo: tr('Descartado'), tom: 'danger' },
]

export const ROTULO_EMAIL = {
    nao_buscado: tr('Sem e-mail'),
    na_fila: tr('Na fila'),
    buscando: tr('Procurando...'),
    nao_encontrado: tr('Não achado no site'),
    sem_site: tr('Sem site'),
}

export const ROTULO_FONTE = {
    npi: 'NPI',
    google: 'Google',
    empresas_novas: tr('Empresa nova'),
    licencas: tr('Licença'),
}

// Nomes legíveis dos dados extras de cada fonte.
export const ROTULO_EXTRA = {
    npi: tr('Número NPI'),
    tipo: tr('Tipo'),
    licenca: tr('Licença'),
    desde: tr('Cadastrado desde'),
    nota: tr('Nota no Google'),
    avaliacoes: tr('Avaliações'),
    abertura: tr('Abertura'),
    situacao: tr('Situação no estado'),
    naics: tr('Ramo (NAICS)'),
    condado: tr('Condado'),
    validade: tr('Validade da licença'),
}

export const FILTROS_VAZIOS = { busca: '', fonte: '', status: '', estado: '', comEmail: '', comTelefone: '', buscaId: '' }

export function montarQuery(filtros, pagina, porPagina) {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([chave, valor]) => { if (valor) params.set(chave, valor) })
    if (pagina) params.set('pagina', pagina)
    if (porPagina) params.set('porPagina', porPagina)
    return params.toString()
}

export function emBuscaDeEmail(lead) {
    return lead.emailStatus === 'na_fila' || lead.emailStatus === 'buscando'
}

// Algo deste lead ainda está andando no servidor (procura do e-mail no site ou envio na fila).
export function emAndamento(lead) {
    return emBuscaDeEmail(lead) || lead.envioPendente
}

export function baixarArquivo(conteudo, nomeArquivo, tipo = 'text/csv;charset=utf-8') {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

export function linkDoSite(site) {
    return /^https?:\/\//i.test(site) ? site : `https://${site}`
}

export function siteSemProtocolo(site) {
    return site.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
}
