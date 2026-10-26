import { useCallback, useEffect, useMemo, useState } from 'react';
import { IdiomaContext } from './IdiomaContext';
import { lerIdioma, salvarIdioma, LOCALE } from './idioma';

export function IdiomaProvider({ children }) {
  const [idioma] = useState(lerIdioma);

  useEffect(() => {
    salvarIdioma(idioma);
  }, [idioma]);

  // Trocar de idioma guarda a escolha e recarrega a página: todo o sistema volta já no idioma novo.
  const setIdioma = useCallback((novo) => {
    salvarIdioma(novo, true);
    window.location.reload();
  }, []);

  const valor = useMemo(() => ({ idioma, setIdioma, locale: LOCALE[idioma] }), [idioma, setIdioma]);

  return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>;
}

export default IdiomaProvider;
