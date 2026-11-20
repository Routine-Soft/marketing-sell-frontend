import { tr } from '@/i18n'

// Campos do ICP e da persona, no formato das colunas do ItemModal.
// secao = abre um grupo com título (no modal e no painel); curto = rótulo usado no painel e no cartão;
// resumo = aparece no cartão da persona.
export const CAMPOS_DO_ICP = [
    { secao: tr('Perfil da empresa'), campo: 'nome', rotulo: tr('Nome do ICP'), exemplo: tr('Ex.: Clínicas de psicologia pequenas'), maximo: 120, obrigatorio: true, largo: true },
    { campo: 'tamanho', rotulo: tr('Tamanho (equipe, faturamento)'), curto: tr('Tamanho'), exemplo: tr('Ex.: 1 a 5 profissionais'), maximo: 3000 },
    { campo: 'regiao', rotulo: tr('Local'), exemplo: tr('Ex.: Capitais do Sudeste'), maximo: 3000 },
    { campo: 'tempo', rotulo: tr('Tempo de funcionamento'), exemplo: tr('Ex.: Abriu há menos de 2 anos'), maximo: 3000 },
    { secao: tr('Quem decide e quem usa'), campo: 'decisor', rotulo: tr('Quem decide'), exemplo: tr('Ex.: O dono da clínica'), maximo: 3000 },
    { campo: 'usuarios', rotulo: tr('Quem usa'), exemplo: tr('Ex.: Os psicólogos e a secretária'), maximo: 3000 },
    { campo: 'influencia', rotulo: tr('Quem influencia'), exemplo: tr('Ex.: O contador, colegas de profissão'), maximo: 3000, largo: true },
    { secao: tr('Situação e dor'), campo: 'situacaoAtual', rotulo: tr('Situação atual: o que usam hoje'), curto: tr('O que usam hoje'), tipo: 'textarea', linhas: 2, maximo: 3000 },
    { campo: 'dor', rotulo: tr('Dor: o que dói no dia a dia'), curto: tr('Dor'), tipo: 'textarea', linhas: 3, maximo: 3000 },
    { secao: tr('Compra'), campo: 'gatilho', rotulo: tr('Gatilho: o que faz comprar agora, e não daqui a um ano'), curto: tr('Gatilho'), tipo: 'textarea', linhas: 2, maximo: 3000 },
    { campo: 'ticket', rotulo: tr('Capacidade de pagar: o ticket que aguentam'), curto: tr('Capacidade de pagar'), exemplo: tr('Ex.: Até R$ 150 por mês'), maximo: 3000, largo: true },
    { secao: tr('Onde encontrar e quem evitar'), campo: 'ondeEncontrar', rotulo: tr('Onde encontrar: canais'), curto: tr('Onde encontrar'), tipo: 'textarea', linhas: 2, maximo: 3000 },
    { campo: 'antiIcp', rotulo: tr('Anti-ICP: quem você não quer como cliente'), curto: tr('Anti-ICP'), tipo: 'textarea', linhas: 2, maximo: 3000 },
    { secao: tr('Livre'), campo: 'anotacoes', rotulo: tr('Anotações'), tipo: 'textarea', linhas: 6, maximo: 20000 },
]

export const CAMPOS_DA_PERSONA = [
    { secao: tr('Quem é'), campo: 'nome', rotulo: tr('Nome fictício'), exemplo: tr('Ex.: Ana'), maximo: 120, obrigatorio: true },
    { campo: 'cargo', rotulo: tr('Cargo'), exemplo: tr('Ex.: Psicóloga e dona do consultório'), maximo: 3000 },
    { campo: 'idade', rotulo: tr('Idade aproximada'), exemplo: tr('Ex.: 30 a 40 anos'), maximo: 3000 },
    { campo: 'formacao', rotulo: tr('Formação'), exemplo: tr('Ex.: Psicologia, pós em TCC'), maximo: 3000 },
    { secao: tr('Dia a dia'), campo: 'rotina', rotulo: tr('Rotina: como é o dia dela'), curto: tr('Rotina'), tipo: 'textarea', linhas: 3, maximo: 3000 },
    { campo: 'objetivos', rotulo: tr('Objetivos: o que ela quer alcançar'), curto: tr('Objetivos'), tipo: 'textarea', linhas: 3, maximo: 3000, resumo: true },
    { campo: 'frustracoes', rotulo: tr('Frustrações: o que tira o sono dela'), curto: tr('Frustrações'), tipo: 'textarea', linhas: 3, maximo: 3000, resumo: true },
    { campo: 'objecoes', rotulo: tr('Objeções: por que ela diria "não"'), curto: tr('Objeções'), tipo: 'textarea', linhas: 3, maximo: 3000, resumo: true },
    { secao: tr('Como chegar nela'), campo: 'canais', rotulo: tr('Onde se informa: redes, grupos, quem ela escuta'), curto: tr('Onde se informa'), tipo: 'textarea', linhas: 2, maximo: 3000 },
    { campo: 'abordagem', rotulo: tr('Como falar com ela: o tom e as palavras certas'), curto: tr('Como falar com ela'), tipo: 'textarea', linhas: 3, maximo: 3000, resumo: true },
    { campo: 'frase', rotulo: tr('Frase que ela diria'), exemplo: tr('Ex.: "Não tenho tempo para organizar a agenda"'), maximo: 3000, largo: true },
    { secao: tr('Livre'), campo: 'anotacoes', rotulo: tr('Anotações'), tipo: 'textarea', linhas: 6, maximo: 20000 },
]

// Campos preenchidos do item, agrupados pelas seções (as seções vazias somem). Usado no painel do ICP.
export function secoesPreenchidas(campos, item, pular = []) {
    const secoes = []
    campos.forEach((campo) => {
        if (campo.secao) secoes.push({ titulo: campo.secao, campos: [] })
        if (item[campo.campo] && !pular.includes(campo.campo)) secoes.at(-1).campos.push(campo)
    })
    return secoes.filter((secao) => secao.campos.length > 0)
}
