import { IconeBusca, IconeX } from '@/components/CrudCard/icones'
import { useAtividadesCnpj } from '../captacao.hooks'
import { tr, localeAtual } from '@/i18n'

// Atividades (CNAE) da busca de CNPJs: as que já estão na base, com quantas empresas cada uma tem (marcar = entra nesta
// busca; nenhuma marcada = todas), e a busca pelo nome para acrescentar outras, que ficam guardadas no negócio.
export default function AtividadesCnpj({ iniciais, selecionadas, onSelecionar }) {
  const { lista, termo, setTermo, achadas, erro, adicionar, remover } = useAtividadesCnpj(iniciais)
  const alternar = (codigo) => onSelecionar(selecionadas.includes(codigo) ? selecionadas.filter((c) => c !== codigo) : [...selecionadas, codigo])

  async function escolher(atividade) {
    if (await adicionar(atividade)) {
      onSelecionar([...selecionadas, atividade.codigo])
      setTermo('')
    }
  }

  async function tirar(codigo) {
    if (await remover(codigo)) onSelecionar(selecionadas.filter((c) => c !== codigo))
  }

  return (
    <fieldset className="field field--full atividades">
      <legend className="field__label">{tr('Atividades (CNAE)')}</legend>
      {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}

      {lista.length === 0 ? (
        <p className="field__hint">{tr('Nenhuma atividade ainda. Procure abaixo pelo nome do nicho (ex.: psicologia, academia, salão de beleza).')}</p>
      ) : (
        <>
        <p className="field__hint">{selecionadas.length ? tr('{n} marcadas.', { n: selecionadas.length }) : tr('Nenhuma marcada: a busca traz todas as atividades da lista.')}</p>
        <ul className="atividades__lista">
          {lista.map((atividade) => (
            <li key={atividade.codigo} className="atividades__item">
              <label className="check">
                <input type="checkbox" checked={selecionadas.includes(atividade.codigo)} onChange={() => alternar(atividade.codigo)} />
                <span>{atividade.descricao || atividade.codigo} <small>{atividade.codigo}</small></span>
              </label>
              {atividade.total > 0 ? (
                <span className="badge" title={tr('Empresas desta atividade na base')}>{atividade.total.toLocaleString(localeAtual())}</span>
              ) : (
                <>
                  <span className="badge badge--warning" title={tr('Esta atividade ainda não foi trazida da Receita.')}>{tr('Fora da base')}</span>
                  <button type="button" className="icon-btn" aria-label={tr('Tirar {nome}', { nome: atividade.descricao })} title={tr('Tirar da lista')} onClick={() => tirar(atividade.codigo)}>
                    <IconeX />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        </>
      )}

      <label className="search atividades__busca">
        <IconeBusca />
        <input className="input" type="search" value={termo} onChange={(e) => setTermo(e.target.value)}
          placeholder={tr('Acrescentar atividade: psicologia, academia, 9602501...')} aria-label={tr('Procurar atividade')} />
      </label>
      {achadas.length > 0 && (
        <ul className="atividades__achadas" role="listbox" aria-label={tr('Atividades encontradas')}>
          {achadas.map((atividade) => (
            <li key={atividade.codigo}>
              <button type="button" className="atividades__achada" onClick={() => escolher(atividade)}>
                <span>{atividade.descricao}</span>
                <small>{atividade.codigo}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  )
}
