import AbaDeLista from '@/components/Planilha/AbaDeLista'
import { tr } from '@/i18n'

// Lista de tarefas que se faz uma vez só: linha feita fica verde e riscada, como na planilha.
export default function Checklist({ api, titulo, subtitulo, rotuloDoGrupo, comDetalhe = false }) {
  const colunas = [
    { campo: 'grupo', rotulo: rotuloDoGrupo, peso: 14 },
    { campo: 'tarefa', rotulo: tr('Tarefa (fazer uma vez)'), obrigatorio: true, destaque: true, peso: comDetalhe ? 36 : 60, largo: true },
    ...(comDetalhe ? [{ campo: 'detalhe', rotulo: tr('Detalhe'), peso: 30, largo: true }] : []),
    { campo: 'feito', rotulo: tr('Feito'), tipo: 'check', peso: 7 },
    { campo: 'feitoEm', rotulo: tr('Data'), tipo: 'data', peso: 10 },
  ]

  return (
    <AbaDeLista api={api} titulo={titulo} subtitulo={subtitulo} colunas={colunas} principal="tarefa"
      textoAdicionar={tr('Adicionar tarefa')} tituloNovo={tr('Nova tarefa')} tituloEditar={tr('Editar tarefa')}
      vazio={tr('Nenhuma tarefa ainda. Toque em "Adicionar tarefa".')}
      estadoDaLinha={(item) => (item.feito ? 'feito' : '')} riscada={(item) => item.feito}
      acoes={(itens) => itens && <strong>{tr('{feitos} de {total} feitos', { feitos: itens.filter((item) => item.feito).length, total: itens.length })}</strong>} />
  )
}
