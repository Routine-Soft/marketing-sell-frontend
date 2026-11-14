import AbaDeLista from '@/components/Planilha/AbaDeLista'
import { dataCurta } from '@/components/Planilha/planilha.utils'
import { CANAIS_CONTATO } from '@/modules/lead/lead.utils'
import { parceiroApi } from '../parceiro.api'
import { STATUS_PARCEIRO, TIPOS_PARCEIRO } from '../parceiro.utils'
import { tr } from '@/i18n'

const ROTULO_CANAL = Object.fromEntries(CANAIS_CONTATO.map((canal) => [canal.valor, canal.rotulo]))

const COLUNAS = [
  { campo: 'nome', rotulo: tr('Nome'), obrigatorio: true, destaque: true, peso: 16, sub: (parceiro) => tr('desde {data}', { data: dataCurta(parceiro.createdAt) }) },
  { campo: 'tipo', rotulo: tr('Tipo'), tipo: 'selecao', opcoes: TIPOS_PARCEIRO, peso: 11 },
  { campo: 'contato', rotulo: tr('Contato (tel / e-mail / @)'), peso: 16 },
  {
    campo: 'primeiroContatoEm', rotulo: tr('1º contato'), tipo: 'data', peso: 10,
    sub: (parceiro) => ROTULO_CANAL[parceiro.canal] ?? '',
  },
  { campo: 'canal', rotulo: tr('Canal do 1º contato'), tipo: 'selecao', opcoes: CANAIS_CONTATO, vazio: '—', soFormulario: true },
  {
    campo: 'status', rotulo: tr('Status'), tipo: 'selecao', rapido: true, opcoes: STATUS_PARCEIRO, peso: 13,
    estado: (parceiro) => (parceiro.status === 'parceiro_ativo' ? 'feito' : ''),
  },
  { campo: 'comissao', rotulo: tr('Comissão combinada'), peso: 11 },
  { campo: 'linkRastreavel', rotulo: tr('Link rastreável'), tipo: 'link', peso: 12, largo: true },
  { campo: 'observacao', rotulo: tr('Observações'), tipo: 'textarea', peso: 11 },
]

export default function Parceiros() {
  return (
    <AbaDeLista api={parceiroApi} titulo={tr('Parceiros')} colunas={COLUNAS} principal="nome"
      subtitulo={tr('Contadores, influenciadores e vendedores que indicam clientes. Cada parceiro novo conta na rotina do dia.')}
      textoAdicionar={tr('Adicionar parceiro')} tituloNovo={tr('Novo parceiro')} tituloEditar={tr('Editar parceiro')}
      vazio={tr('Nenhum parceiro ainda. Toque em "Adicionar parceiro".')}
      riscada={(parceiro) => parceiro.status === 'sem_interesse'} />
  )
}
