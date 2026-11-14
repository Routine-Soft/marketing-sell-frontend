import Checklist from './Checklist'
import { preparacaoApi } from '../checklist.api'
import { tr } from '@/i18n'

export default function Preparacao() {
  return (
    <Checklist api={preparacaoApi} titulo={tr('Preparação')} rotuloDoGrupo={tr('Área')} comDetalhe
      subtitulo={tr('O que arrumar uma vez só, antes de a rotina rodar redonda. Marque quando fizer.')} />
  )
}
