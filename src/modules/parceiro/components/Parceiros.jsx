import Planilha from '@/components/Planilha/Planilha'
import TelaDePlanilha from '@/components/Planilha/TelaDePlanilha'
import { useLista } from '@/hooks/useLista'
import { CANAIS_CONTATO } from '@/modules/lead/lead.utils'
import { parceiroApi } from '../parceiro.api'
import { STATUS_PARCEIRO, TIPOS_PARCEIRO } from '../parceiro.utils'
import { tr } from '@/i18n'

const COLUNAS = [
  { campo: 'createdAt', rotulo: tr('Data cadastro'), tipo: 'leitura', largura: 110 },
  { campo: 'nome', rotulo: tr('Nome'), largura: 200 },
  { campo: 'tipo', rotulo: tr('Tipo'), tipo: 'selecao', opcoes: TIPOS_PARCEIRO, largura: 160 },
  { campo: 'contato', rotulo: tr('Contato (tel / e-mail / @)'), largura: 200 },
  { campo: 'canal', rotulo: tr('Canal'), tipo: 'selecao', opcoes: CANAIS_CONTATO, vazio: '—', largura: 150 },
  { campo: 'primeiroContatoEm', rotulo: tr('Data 1º contato'), tipo: 'data', largura: 150 },
  {
    campo: 'status', rotulo: tr('Status'), tipo: 'selecao', opcoes: STATUS_PARCEIRO, largura: 160,
    estado: (parceiro) => (parceiro.status === 'parceiro_ativo' ? 'feito' : ''),
  },
  { campo: 'comissao', rotulo: tr('Comissão combinada'), largura: 170 },
  { campo: 'linkRastreavel', rotulo: tr('Link rastreável'), tipo: 'link', largura: 230 },
  { campo: 'observacao', rotulo: tr('Observações'), largura: 260 },
]

export default function Parceiros() {
  const { itens, erro, criar, salvar, excluir } = useLista(parceiroApi)

  return (
    <TelaDePlanilha titulo={tr('Parceiros')} erro={erro} carregando={!itens}
      subtitulo={tr('Contadores, influenciadores e vendedores que indicam clientes. Cada parceiro novo conta na rotina do dia.')}>
      <Planilha colunas={COLUNAS} linhas={itens ?? []} campoNovo="nome" textoNovo={tr('Digite o nome do parceiro novo')}
        onCriar={criar} onSalvar={salvar} onExcluir={excluir}
        riscada={(parceiro) => parceiro.status === 'sem_interesse'} />
    </TelaDePlanilha>
  )
}
