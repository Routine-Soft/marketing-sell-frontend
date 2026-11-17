import { tr } from '@/i18n'

export const STATUS = [
    { valor: 'novo', rotulo: tr('Novo'), tom: 'info' },
    { valor: 'contatado', rotulo: tr('Contatado'), tom: 'warning' },
    { valor: 'respondeu', rotulo: tr('Respondeu'), tom: 'primary' },
    { valor: 'follow_up', rotulo: tr('Follow-up'), tom: 'warning' },
    { valor: 'interessado', rotulo: tr('Interessado'), tom: 'primary' },
    { valor: 'demo', rotulo: tr('Demo marcada'), tom: 'primary' },
    { valor: 'teste_gratis', rotulo: tr('Teste grátis'), tom: 'primary' },
    { valor: 'cliente', rotulo: tr('Cliente'), tom: 'success' },
    { valor: 'descartado', rotulo: tr('Perdido'), tom: 'danger' },
]

// Por onde a pessoa falou com o lead (o contato conta para o follow-up de 3, 7 e 14 dias).
export const CANAIS_CONTATO = [
    { valor: 'ligacao', rotulo: tr('Ligação') },
    { valor: 'whatsapp', rotulo: 'WhatsApp' },
    { valor: 'email', rotulo: tr('E-mail') },
    { valor: 'dm', rotulo: tr('Mensagem na rede social') },
    { valor: 'visita', rotulo: tr('Visita') },
]

const SEM_RESPOSTA = ['novo', 'contatado']

// 'vencido' = já passou do dia do follow-up; 'encerrar' = 4 contatos sem resposta; '' = nada a fazer agora.
export function situacaoDoFollowUp(lead) {
    if (!SEM_RESPOSTA.includes(lead.status)) return ''
    if (lead.proximoFollowUpEm) return new Date(lead.proximoFollowUpEm) <= new Date() ? 'vencido' : 'marcado'
    return lead.numeroContatos >= 4 ? 'encerrar' : ''
}

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
    cnpj: tr('CNPJ (Receita)'),
    manual: tr('Cadastro manual'),
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
    cnpj: 'CNPJ',
    cnae: 'CNAE',
}

export const FILTROS_VAZIOS = { busca: '', fonte: '', status: '', estado: '', comEmail: '', comTelefone: '', buscaId: '', followUp: '', ordem: '' }

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

// Fontes de leads dos EUA (telefone de 10 dígitos leva o código 1); as demais são do Brasil (código 55).
const FONTES_EUA = ['npi', 'empresas_novas', 'licencas']

// Link do WhatsApp (wa.me) a partir do telefone do lead; vazio se o número não parece válido.
export function linkWhatsapp(lead) {
    const bruto = (lead.telefone || '').trim()
    let digitos = bruto.replace(/\D/g, '').replace(/^00/, '')
    if (!bruto.startsWith('+') && (digitos.length === 10 || digitos.length === 11)) {
        digitos = (FONTES_EUA.includes(lead.fonte) ? '1' : '55') + digitos
    }
    return digitos.length >= 11 && digitos.length <= 15 ? `https://wa.me/${digitos}` : ''
}
