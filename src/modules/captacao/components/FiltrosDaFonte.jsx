import { rotuloDaOpcao } from '../captacao.utils'
import { tr } from '@/i18n'

function Campo({ id, rotulo, dica, children, largo = false }) {
  return (
    <div className={`field${largo ? ' field--full' : ''}`}>
      <label className="field__label" htmlFor={id}>{rotulo}</label>
      {children}
      {dica && <span className="field__hint">{dica}</span>}
    </div>
  )
}

function SeletorEstado({ id, valor, estados, onChange, obrigatorio = true }) {
  return (
    <select id={id} className="input" value={valor} onChange={(e) => onChange(e.target.value)} required={obrigatorio}>
      <option value="">{tr('Escolha')}</option>
      {estados.map((e) => (
        <option key={e.valor ?? e} value={e.valor ?? e}>{e.nome ? `${e.nome} (${e.valor})` : e}</option>
      ))}
    </select>
  )
}

function Quantidade({ id, valor, maximo, onChange }) {
  return (
    <Campo id={id} rotulo={tr('Quantidade máxima')} dica={tr('Até {max}', { max: maximo })}>
      <input id={id} className="input" type="number" min="1" max={maximo} inputMode="numeric" value={valor}
        onChange={(e) => onChange(e.target.value)} />
    </Campo>
  )
}

// Campos de cada fonte. `filtros` e `mudar(campo, valor)` vêm da tela de captação.
export default function FiltrosDaFonte({ fonte, filtros, mudar, opcoes }) {
  if (fonte === 'npi') {
    return (
      <>
        <Campo id="npi-especialidade" rotulo={tr('Especialidade')} largo>
          <select id="npi-especialidade" className="input" value={filtros.especialidade}
            onChange={(e) => mudar('especialidade', e.target.value)} required>
            <option value="">{tr('Escolha')}</option>
            {opcoes.npi.especialidades.map((e) => <option key={e.valor} value={e.valor}>{rotuloDaOpcao(e)}</option>)}
          </select>
        </Campo>
        <Campo id="npi-estado" rotulo={tr('Estado')}>
          <SeletorEstado id="npi-estado" valor={filtros.estado} estados={opcoes.estadosEua} onChange={(v) => mudar('estado', v)} />
        </Campo>
        <Campo id="npi-cidade" rotulo={tr('Cidade (opcional)')}>
          <input id="npi-cidade" className="input" value={filtros.cidade} onChange={(e) => mudar('cidade', e.target.value)} placeholder="Santa Monica" />
        </Campo>
        <Campo id="npi-cep" rotulo={tr('ZIP code (opcional)')} dica={tr('Pode ser só o começo, ex.: 904')}>
          <input id="npi-cep" className="input" inputMode="numeric" maxLength={5} value={filtros.cep} onChange={(e) => mudar('cep', e.target.value)} />
        </Campo>
        <Campo id="npi-tipo" rotulo={tr('Tipo de cadastro')}>
          <select id="npi-tipo" className="input" value={filtros.tipo} onChange={(e) => mudar('tipo', e.target.value)}>
            <option value="">{tr('Profissionais e clínicas')}</option>
            <option value="pessoa">{tr('Só profissionais')}</option>
            <option value="empresa">{tr('Só clínicas')}</option>
          </select>
        </Campo>
        <Quantidade id="npi-quantidade" valor={filtros.quantidade} maximo={1200} onChange={(v) => mudar('quantidade', v)} />
      </>
    )
  }

  if (fonte === 'google') {
    return (
      <>
        <Campo id="google-termo" rotulo={tr('O que procurar')} dica={tr('Em inglês funciona melhor, ex.: massage therapist, plumber, dentist')}>
          <input id="google-termo" className="input" value={filtros.termo} onChange={(e) => mudar('termo', e.target.value)} placeholder="massage therapist" required />
        </Campo>
        <Campo id="google-local" rotulo={tr('Cidade')} dica={tr('Cidade e estado, ex.: Santa Monica, CA')}>
          <input id="google-local" className="input" value={filtros.local} onChange={(e) => mudar('local', e.target.value)} placeholder="Santa Monica, CA" required />
        </Campo>
        <Campo id="google-paginas" rotulo={tr('Páginas')} dica={tr('Cada página traz até 20 empresas e usa 1 da cota')}>
          <select id="google-paginas" className="input" value={filtros.paginas} onChange={(e) => mudar('paginas', Number(e.target.value))}>
            <option value={1}>{tr('1 página (até 20)')}</option>
            <option value={2}>{tr('2 páginas (até 40)')}</option>
            <option value={3}>{tr('3 páginas (até 60)')}</option>
          </select>
        </Campo>
      </>
    )
  }

  if (fonte === 'empresas_novas') {
    return (
      <>
        <Campo id="novas-estado" rotulo={tr('Estado')} dica={tr('Estados que publicam os registros abertamente')}>
          <SeletorEstado id="novas-estado" valor={filtros.estado} estados={opcoes.empresas_novas.estados} onChange={(v) => mudar('estado', v)} />
        </Campo>
        <Campo id="novas-desde" rotulo={tr('Abertas desde')} dica={filtros.estado === 'OR' ? tr('Oregon publica só as empresas do mês passado') : undefined}>
          <input id="novas-desde" className="input" type="date" value={filtros.desde} onChange={(e) => mudar('desde', e.target.value)} required />
        </Campo>
        <Campo id="novas-palavra" rotulo={tr('Palavra no nome (opcional)')} dica={tr('Ex.: massage, plumbing, dental')}>
          <input id="novas-palavra" className="input" value={filtros.palavra} onChange={(e) => mudar('palavra', e.target.value)} />
        </Campo>
        <Campo id="novas-cidade" rotulo={tr('Cidade (opcional)')}>
          <input id="novas-cidade" className="input" value={filtros.cidade} onChange={(e) => mudar('cidade', e.target.value)} />
        </Campo>
        <Quantidade id="novas-quantidade" valor={filtros.quantidade} maximo={2000} onChange={(v) => mudar('quantidade', v)} />
      </>
    )
  }

  if (fonte === 'licencas') {
    const estado = opcoes.licencas.estados.find((e) => e.valor === filtros.estado) ?? opcoes.licencas.estados[0]
    return (
      <>
        <Campo id="licencas-estado" rotulo={tr('Estado')}>
          <SeletorEstado id="licencas-estado" valor={filtros.estado} estados={opcoes.licencas.estados} onChange={(v) => mudar('estado', v)} />
        </Campo>
        <Campo id="licencas-tipo" rotulo={tr('Tipo de prestador')}>
          <select id="licencas-tipo" className="input" value={filtros.tipo} onChange={(e) => mudar('tipo', e.target.value)} required>
            <option value="">{tr('Escolha')}</option>
            {estado?.tipos.map((t) => <option key={t.valor} value={t.valor}>{rotuloDaOpcao(t)}</option>)}
          </select>
        </Campo>
        <Campo id="licencas-cidade" rotulo={tr('Cidade (opcional)')}>
          <input id="licencas-cidade" className="input" value={filtros.cidade} onChange={(e) => mudar('cidade', e.target.value)} placeholder="Austin" />
        </Campo>
        <Campo id="licencas-condado" rotulo={tr('Condado (opcional)')}>
          <input id="licencas-condado" className="input" value={filtros.condado} onChange={(e) => mudar('condado', e.target.value)} placeholder="Travis" />
        </Campo>
        <Campo id="licencas-palavra" rotulo={tr('Palavra no nome (opcional)')}>
          <input id="licencas-palavra" className="input" value={filtros.palavra} onChange={(e) => mudar('palavra', e.target.value)} />
        </Campo>
        <Quantidade id="licencas-quantidade" valor={filtros.quantidade} maximo={2000} onChange={(v) => mudar('quantidade', v)} />
      </>
    )
  }

  return null
}
