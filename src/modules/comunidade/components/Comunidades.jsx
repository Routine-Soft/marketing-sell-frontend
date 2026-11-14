import Planilha from '@/components/Planilha/Planilha'
import TelaDePlanilha from '@/components/Planilha/TelaDePlanilha'
import { useLista } from '@/hooks/useLista'
import { hojeEmBrasilia } from '@/modules/rotina/rotina.utils'
import { comunidadeApi } from '../comunidade.api'
import { TIPOS_COMUNIDADE, eventoChegando } from '../comunidade.utils'
import { tr } from '@/i18n'

export default function Comunidades() {
  const { itens, erro, criar, salvar, excluir } = useLista(comunidadeApi)
  const hoje = hojeEmBrasilia()

  const colunas = [
    { campo: 'tipo', rotulo: tr('Tipo'), tipo: 'selecao', opcoes: TIPOS_COMUNIDADE, largura: 170 },
    { campo: 'plataforma', rotulo: tr('Plataforma / Local'), largura: 170 },
    { campo: 'nome', rotulo: tr('Nome'), largura: 230 },
    { campo: 'link', rotulo: tr('Link'), tipo: 'link', largura: 230 },
    { campo: 'entrei', rotulo: tr('Entrei / Inscrito'), tipo: 'check', largura: 120, estado: (linha) => (linha.entrei ? 'feito' : '') },
    { campo: 'dataEvento', rotulo: tr('Data do evento'), tipo: 'data', largura: 150, estado: (linha) => (eventoChegando(linha, hoje) ? 'aviso' : '') },
    { campo: 'participei', rotulo: tr('Participei'), tipo: 'check', largura: 100, estado: (linha) => (linha.participei ? 'feito' : '') },
    { campo: 'observacao', rotulo: tr('Observações'), largura: 260 },
  ]

  return (
    <TelaDePlanilha titulo={tr('Comunidades e eventos')} erro={erro} carregando={!itens}
      subtitulo={tr('Grupos, eventos e associações onde estão os seus possíveis clientes. Evento nos próximos 7 dias fica amarelo.')}>
      <Planilha colunas={colunas} linhas={itens ?? []} campoNovo="nome" textoNovo={tr('Digite o nome do grupo ou evento')}
        onCriar={criar} onSalvar={salvar} onExcluir={excluir} />
    </TelaDePlanilha>
  )
}
