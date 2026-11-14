import AbaDeLista from '@/components/Planilha/AbaDeLista'
import { hojeEmBrasilia } from '@/modules/rotina/rotina.utils'
import { comunidadeApi } from '../comunidade.api'
import { TIPOS_COMUNIDADE, eventoChegando } from '../comunidade.utils'
import { tr } from '@/i18n'

export default function Comunidades() {
  const hoje = hojeEmBrasilia()
  const colunas = [
    { campo: 'tipo', rotulo: tr('Tipo'), tipo: 'selecao', opcoes: TIPOS_COMUNIDADE, peso: 10 },
    { campo: 'plataforma', rotulo: tr('Plataforma / Local'), peso: 12, exemplo: tr('Ex.: Facebook, WhatsApp, São Paulo') },
    { campo: 'nome', rotulo: tr('Nome'), obrigatorio: true, destaque: true, peso: 18 },
    { campo: 'link', rotulo: tr('Link'), tipo: 'link', peso: 15, largo: true },
    { campo: 'entrei', rotulo: tr('Entrei / Inscrito'), tipo: 'check', peso: 8, estado: (linha) => (linha.entrei ? 'feito' : '') },
    { campo: 'dataEvento', rotulo: tr('Data do evento'), tipo: 'data', peso: 9, estado: (linha) => (eventoChegando(linha, hoje) ? 'aviso' : '') },
    { campo: 'participei', rotulo: tr('Participei'), tipo: 'check', peso: 8, estado: (linha) => (linha.participei ? 'feito' : '') },
    { campo: 'observacao', rotulo: tr('Observações'), tipo: 'textarea', peso: 14 },
  ]

  return (
    <AbaDeLista api={comunidadeApi} titulo={tr('Comunidades e eventos')} colunas={colunas} principal="nome"
      subtitulo={tr('Grupos, eventos e associações onde estão os seus possíveis clientes. Evento nos próximos 7 dias fica amarelo.')}
      textoAdicionar={tr('Adicionar')} tituloNovo={tr('Novo grupo ou evento')} tituloEditar={tr('Editar grupo ou evento')}
      vazio={tr('Nada aqui ainda. Toque em "Adicionar".')} />
  )
}
