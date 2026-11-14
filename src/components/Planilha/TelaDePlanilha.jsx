import { tr } from '@/i18n'

// Moldura das abas: faixa de título na cor da aba, erro e o carregamento em linhas.
export default function TelaDePlanilha({ titulo, subtitulo, acoes, erro, carregando, rodape, children }) {
  return (
    <div className="page page--planilha">
      <header className="plan-titulo">
        <div>
          <h2>{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
        {acoes && <div className="plan-titulo__acoes">{acoes}</div>}
      </header>

      {erro && <p className="alert alert--error" role="alert">{erro.message}</p>}

      {carregando ? (
        <div className="plan-wrap plan-carregando" aria-busy="true" aria-label={tr('Carregando')}>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton skeleton--line" style={{ height: 30 }} />)}
        </div>
      ) : children}

      {rodape && <p className="plan-rodape">{rodape}</p>}
    </div>
  )
}
