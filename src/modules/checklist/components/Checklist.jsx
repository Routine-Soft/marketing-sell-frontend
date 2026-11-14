import Planilha from '@/components/Planilha/Planilha'
import TelaDePlanilha from '@/components/Planilha/TelaDePlanilha'
import { useLista } from '@/hooks/useLista'
import { tr } from '@/i18n'

// Lista de tarefas que se faz uma vez só: linha feita fica verde e riscada, como na planilha.
export default function Checklist({ api, titulo, subtitulo, rotuloDoGrupo, comDetalhe = false }) {
  const { itens, erro, criar, salvar, excluir } = useLista(api)
  const feitos = itens?.filter((item) => item.feito).length ?? 0

  const colunas = [
    { campo: 'grupo', rotulo: rotuloDoGrupo, largura: 170 },
    { campo: 'tarefa', rotulo: tr('Tarefa (fazer uma vez)'), largura: 470 },
    ...(comDetalhe ? [{ campo: 'detalhe', rotulo: tr('Detalhe'), largura: 430 }] : []),
    { campo: 'feito', rotulo: tr('Feito'), tipo: 'check', largura: 80 },
    { campo: 'feitoEm', rotulo: tr('Data'), tipo: 'data', largura: 150 },
  ]

  return (
    <TelaDePlanilha titulo={titulo} subtitulo={subtitulo} erro={erro} carregando={!itens}
      acoes={itens && <strong>{tr('{feitos} de {total} feitos', { feitos, total: itens.length })}</strong>}>
      <Planilha colunas={colunas} linhas={itens ?? []} campoNovo="tarefa" textoNovo={tr('Digite uma tarefa nova')}
        onCriar={criar} onSalvar={salvar} onExcluir={excluir}
        estadoDaLinha={(item) => (item.feito ? 'feito' : '')} riscada={(item) => item.feito} />
    </TelaDePlanilha>
  )
}
