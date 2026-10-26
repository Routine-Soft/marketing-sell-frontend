// Símbolo do Marketing Sell: alvo com seta (captar o cliente certo). Usa a cor do texto (currentColor);
// o fundo índigo fica no CSS de quem usa (--gradient-marca).
export default function SimboloMarca() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="13" r="8" />
      <circle cx="11" cy="13" r="4" />
      <path d="M11 13 20 4M16 4h4v4" />
    </svg>
  );
}
