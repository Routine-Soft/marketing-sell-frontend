import { tr } from '@/i18n'

// O que muda entre ideias de vídeo e de artigo: nomes dos campos e das situações.
export const CONFIG_DO_TIPO = {
    video: {
        titulo: tr('Ideias de vídeo'),
        subtitulo: tr('Roteiro e legenda de cada vídeo, no dia em que vai ser postado. Um dia pode ter vários.'),
        novo: tr('Nova ideia de vídeo'),
        editar: tr('Editar ideia de vídeo'),
        roteiro: tr('Roteiro'),
        legenda: tr('Legenda'),
        exemploTitulo: tr('Ex.: 3 erros na agenda do consultório'),
        copiar: tr('Copiar legenda'),
        status: [
            { valor: 'ideia', rotulo: tr('Ideia') },
            { valor: 'pronto', rotulo: tr('Roteiro pronto') },
            { valor: 'publicado', rotulo: tr('Postado') },
        ],
    },
    artigo: {
        titulo: tr('Ideias de artigo'),
        subtitulo: tr('Pauta e texto de cada artigo do blog, no dia em que vai ser publicado. Um dia pode ter vários.'),
        novo: tr('Nova ideia de artigo'),
        editar: tr('Editar ideia de artigo'),
        roteiro: tr('Texto do artigo'),
        legenda: tr('Resumo (para o Google e as redes)'),
        exemploTitulo: tr('Ex.: Como organizar a agenda do consultório'),
        copiar: tr('Copiar resumo'),
        status: [
            { valor: 'ideia', rotulo: tr('Ideia') },
            { valor: 'pronto', rotulo: tr('Texto pronto') },
            { valor: 'publicado', rotulo: tr('Publicado') },
        ],
    },
}

// As ideias separadas por dia ('' = sem data).
export function porDia(ideias) {
    const grupos = { '': [] }
    ideias.forEach((ideia) => { (grupos[ideia.dia] ??= []).push(ideia) })
    return grupos
}

// Todos os dias do período, do mais antigo ao mais novo.
export function diasDoPeriodo(de, ate, somarDias) {
    const dias = []
    for (let dia = de; dia <= ate; dia = somarDias(dia, 1)) dias.push(dia)
    return dias
}
