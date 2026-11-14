import Checklist from './Checklist'
import { anunciosApi } from '../checklist.api'
import { tr } from '@/i18n'

export default function Anuncios() {
  return (
    <Checklist api={anunciosApi} titulo={tr('Anúncios pagos — opcional (só quando decidir investir)')} rotuloDoGrupo={tr('Plataforma')}
      subtitulo={tr('Não conta no % da rotina. Comece com orçamento pequeno e só aumente quando souber quanto custa conquistar 1 cliente.')} />
  )
}
