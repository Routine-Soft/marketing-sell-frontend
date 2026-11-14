import { useState } from 'react'
import { IconeMais } from '@/components/CrudCard/icones'
import { useLista } from '@/hooks/useLista'
import ItemModal from './ItemModal'
import Planilha from './Planilha'
import TelaDePlanilha from './TelaDePlanilha'

// Aba simples da planilha (parceiros, comunidades, preparação...): a grade, o botão de adicionar e o modal.
export default function AbaDeLista({ api, titulo, subtitulo, colunas, principal, textoAdicionar, tituloNovo, tituloEditar, vazio, acoes, estadoDaLinha, riscada, children }) {
  const { itens, erro, sucesso, limparAvisos, criar, salvar, excluir } = useLista(api)
  const [modal, setModal] = useState(null)

  function abrir(item) {
    limparAvisos()
    setModal({ item })
  }

  return (
    <TelaDePlanilha titulo={titulo} subtitulo={subtitulo} erro={!modal && erro} carregando={!itens}
      acoes={(
        <>
          {acoes?.(itens)}
          <button type="button" className="btn btn--sm btn--primary" onClick={() => abrir(null)}><IconeMais /> {textoAdicionar}</button>
        </>
      )}>
      {!modal && sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}
      {children}
      <Planilha colunas={colunas} linhas={itens ?? []} principal={principal} vazio={vazio}
        onEditar={abrir} onSalvar={salvar} onExcluir={excluir} estadoDaLinha={estadoDaLinha} riscada={riscada} />
      {modal && (
        <ItemModal titulo={modal.item ? tituloEditar : tituloNovo} colunas={colunas} item={modal.item} erro={erro}
          onSalvar={(dados) => (modal.item ? salvar(modal.item._id, dados) : criar(dados))} onClose={() => setModal(null)} />
      )}
    </TelaDePlanilha>
  )
}
