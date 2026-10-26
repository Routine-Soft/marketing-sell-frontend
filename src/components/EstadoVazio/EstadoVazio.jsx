import { Icone } from '@/components/CrudCard/icones'
import './EstadoVazio.css'

// Lista vazia: ícone, frase curta e o botão da ação (opcional).
export default function EstadoVazio({ icone, titulo, texto, acao }) {
  return (
    <div className="estado-vazio">
      <span className="estado-vazio__icone" aria-hidden="true"><Icone>{icone}</Icone></span>
      <strong className="estado-vazio__titulo">{titulo}</strong>
      {texto && <p className="estado-vazio__texto">{texto}</p>}
      {acao}
    </div>
  )
}
