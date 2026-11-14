// Idioma do sistema (pt, en ou es), guardado no navegador. Na primeira visita, segue o idioma do navegador:
// português em qualquer variante vira pt, espanhol vira es e qualquer outro idioma vira en.
const CHAVE = 'idioma';
const IDIOMAS = ['pt', 'en', 'es'];

function idiomaDoNavegador() {
  const lista = navigator.languages?.length ? navigator.languages : [navigator.language];
  const principal = String(lista.find(Boolean) ?? 'pt').toLowerCase();
  if (principal.startsWith('pt')) return 'pt';
  return principal.startsWith('es') ? 'es' : 'en';
}

export function lerIdioma() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (IDIOMAS.includes(salvo)) return salvo;
  } catch {
    // armazenamento indisponível
  }
  return idiomaDoNavegador();
}

export function salvarIdioma(idioma, escolhido = false) {
  try {
    // Só guarda quando a pessoa escolhe; enquanto não escolher, continua seguindo o navegador.
    if (escolhido) localStorage.setItem(CHAVE, idioma);
  } catch {
    // armazenamento indisponível: vale só nesta sessão
  }
  document.documentElement.lang = { en: 'en', es: 'es' }[idioma] ?? 'pt-BR';
}

export const LOCALE = { pt: 'pt-BR', en: 'en-US', es: 'es' };
