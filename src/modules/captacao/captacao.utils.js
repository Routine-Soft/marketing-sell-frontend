import { idiomaAtual, localeAtual, tr } from '@/i18n'

// Como cada fonte aparece na tela. O id é o mesmo do backend (captacao/fontes).
export const FONTES = {
    npi: {
        nome: tr('Profissionais de saúde (NPI)'),
        descricao: tr('Cadastro oficial do governo dos EUA. Inclui fisioterapeutas, massoterapeutas e quiropraxistas.'),
        traz: [tr('Telefone'), tr('Endereço'), tr('Especialidade')],
    },
    google: {
        nome: tr('Google Maps'),
        descricao: tr('Qualquer nicho em qualquer cidade, como aparece no Google.'),
        traz: [tr('Telefone'), tr('Site'), tr('Avaliações')],
    },
    empresas_novas: {
        nome: tr('Empresas recém-abertas'),
        descricao: tr('Registros novos da Secretaria de Estado (Secretary of State).'),
        traz: [tr('Endereço'), tr('Sócio'), tr('E-mail em Connecticut')],
    },
    licencas: {
        nome: tr('Prestadores licenciados'),
        descricao: tr('Licenças do órgão estadual do Texas: salões de beleza, elétrica, estética e mais.'),
        traz: [tr('Telefone'), tr('Endereço'), tr('Dono')],
    },
}

export const FILTROS_INICIAIS = {
    npi: { especialidade: '', estado: '', cidade: '', cep: '', tipo: '', quantidade: 200 },
    google: { termo: '', local: '', paginas: 3 },
    empresas_novas: { estado: '', desde: diasAtras(30), palavra: '', cidade: '', quantidade: 500 },
    licencas: { estado: 'TX', tipo: '', cidade: '', condado: '', palavra: '', quantidade: 500 },
}

export function diasAtras(dias) {
    return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

// Opção vinda do backend com { valor, pt, en }.
export function rotuloDaOpcao(opcao) {
    return opcao?.[idiomaAtual()] ?? opcao?.pt ?? opcao?.valor ?? ''
}

// Uma linha que resume a busca no histórico: "Massage Therapist · Santa Monica, CA".
export function resumoDosFiltros(busca) {
    const f = busca.filtros ?? {}
    const partes = {
        npi: [f.especialidade, [f.cidade, f.estado].filter(Boolean).join(', '), f.cep],
        google: [f.termo, f.local],
        empresas_novas: [f.palavra && `"${f.palavra}"`, [f.cidade, f.estado].filter(Boolean).join(', '), f.desde && tr('desde {data}', { data: formatarData(f.desde) })],
        licencas: [f.tipo, [f.cidade || f.condado, f.estado].filter(Boolean).join(', '), f.palavra && `"${f.palavra}"`],
    }[busca.fonte] ?? []
    return partes.filter(Boolean).join(' · ')
}

export function formatarData(valor) {
    if (!valor) return ''
    const data = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T12:00:00`) : new Date(valor)
    return data.toLocaleDateString(localeAtual())
}

export function formatarDataHora(valor) {
    return new Date(valor).toLocaleString(localeAtual(), { dateStyle: 'short', timeStyle: 'short' })
}
