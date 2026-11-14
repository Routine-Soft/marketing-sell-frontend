import { Link } from 'react-router-dom'
import TelaDePlanilha from '@/components/Planilha/TelaDePlanilha'
import { useAuthContext } from '@/hooks/useAuthContext'
import { usePainel } from '../rotina.hooks'
import { porcentagem } from '../rotina.utils'
import { localeAtual, tr } from '@/i18n'
import './painel.css'

const numero = (valor) => valor.toLocaleString(localeAtual())

// Verde quando bateu a meta, vermelho claro quando não (as mesmas cores da planilha).
const peloAlvo = (valor, meta) => (valor >= meta ? 'feito' : 'falta')

function Tabela({ titulo, colunas, children }) {
  return (
    <div className="plan-wrap">
      <table className="plan painel__tabela">
        <thead>
          <tr>
            <th>{titulo}</th>
            {colunas.map((coluna) => <th key={coluna} className="plan__numero">{coluna}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Linha({ rotulo, valor, meta, estado, taxa, leitura, link }) {
  return (
    <tr>
      <th scope="row">{link ? <Link className="link" to={link}>{rotulo}</Link> : rotulo}</th>
      <td className="plan__numero painel__valor" data-estado={estado ?? ''}>{valor}</td>
      {meta !== undefined && <td className="plan__numero">{meta}</td>}
      {taxa !== undefined && <td className="plan__numero">{taxa}</td>}
      {leitura !== undefined && <td className="painel__leitura">{leitura}</td>}
    </tr>
  )
}

function Conteudo({ painel }) {
  const { hoje, semana, funil, constancia, parceiros } = painel
  return (
    <div className="painel">
      <div className="painel__coluna">
        <Tabela titulo={tr('Hoje')} colunas={[tr('Valor'), tr('Meta')]}>
          <Linha rotulo={tr('% da rotina de hoje')} valor={`${hoje.percentual}%`} meta="100%" estado={peloAlvo(hoje.percentual, 100)} link="/home" />
          <Linha rotulo={tr('Leads cadastrados hoje')} valor={numero(hoje.leads)} meta={hoje.metaLeads} estado={peloAlvo(hoje.leads, hoje.metaLeads)} />
          <Linha rotulo={tr('Primeiros contatos hoje')} valor={numero(hoje.primeirosContatos)} meta={hoje.metaContatos} estado={peloAlvo(hoje.primeirosContatos, hoje.metaContatos)} />
          <Linha rotulo={tr('Follow-ups pendentes (vencidos até hoje)')} valor={numero(hoje.followUpsPendentes)} meta=""
            estado={hoje.followUpsPendentes > 0 ? 'aviso' : ''} link="/leads?followUp=vencido" />
          <Linha rotulo={tr('Leads para encerrar (4 contatos sem resposta)')} valor={numero(hoje.paraEncerrar)} meta="" link="/leads?followUp=encerrar" />
        </Tabela>

        <Tabela titulo={tr('Esta semana (segunda até hoje)')} colunas={[tr('Valor'), tr('Meta')]}>
          <Linha rotulo={tr('Leads cadastrados')} valor={numero(semana.leads)} meta={semana.metaLeads} estado={peloAlvo(semana.leads, semana.metaLeads)} />
          <Linha rotulo={tr('Primeiros contatos')} valor={numero(semana.primeirosContatos)} meta={semana.metaContatos} estado={peloAlvo(semana.primeirosContatos, semana.metaContatos)} />
          <Linha rotulo={tr('Média da rotina')} valor={`${semana.mediaRotina}%`} meta="100%" estado={peloAlvo(semana.mediaRotina, 100)} />
        </Tabela>

        <Tabela titulo={tr('Constância (últimos 30 dias)')} colunas={[tr('Dias')]}>
          <Linha rotulo={tr('Dias com 100% da rotina')} valor={constancia.dias100} />
          <Linha rotulo={tr('Dias com 80% ou mais')} valor={constancia.dias80} />
          <Linha rotulo={tr('Dias passados abaixo de 50%')} valor={constancia.diasAbaixoDe50} />
        </Tabela>
      </div>

      <div className="painel__coluna">
        <Tabela titulo={tr('Funil (total)')} colunas={[tr('Quantidade'), tr('Taxa'), tr('Como ler a taxa')]}>
          <Linha rotulo={tr('Leads cadastrados')} valor={numero(funil.leads)} taxa="" leitura="" link="/leads" />
          <Linha rotulo={tr('Contatados')} valor={numero(funil.contatados)} taxa={porcentagem(funil.contatados, funil.leads)} leitura={tr('dos leads foram contatados')} />
          <Linha rotulo={tr('Responderam')} valor={numero(funil.responderam)} taxa={porcentagem(funil.responderam, funil.contatados)} leitura={tr('dos contatados responderam')} />
          <Linha rotulo={tr('Demos (marcadas ou feitas)')} valor={numero(funil.demos)} taxa={porcentagem(funil.demos, funil.responderam)} leitura={tr('de quem respondeu marcou demo')} />
          <Linha rotulo={tr('Em teste grátis')} valor={numero(funil.testeGratis)} taxa="" leitura="" />
          <Linha rotulo={tr('Clientes')} valor={numero(funil.clientes)} taxa={porcentagem(funil.clientes, funil.contatados)} leitura={tr('dos contatados viraram cliente')}
            estado={funil.clientes > 0 ? 'feito' : ''} />
          <Linha rotulo={tr('Perdidos')} valor={numero(funil.perdidos)} taxa="" leitura="" />
        </Tabela>

        <Tabela titulo={tr('Parceiros')} colunas={[tr('Quantidade')]}>
          <Linha rotulo={tr('Parceiros listados')} valor={numero(parceiros.listados)} link="/parceiros" />
          <Linha rotulo={tr('Parceiros ativos')} valor={numero(parceiros.ativos)} estado={parceiros.ativos > 0 ? 'feito' : ''} />
        </Tabela>
      </div>
    </div>
  )
}

export default function Painel() {
  const { user } = useAuthContext()
  const { painel, erro } = usePainel()

  return (
    <TelaDePlanilha titulo={`${tr('Painel')}${user?.nomeEmpresa ? ` — ${user.nomeEmpresa}` : ''}`} erro={erro} carregando={!painel && !erro}
      subtitulo={tr('Tudo aqui é automático. Você só alimenta as abas Rotina diária, Leads e Parceiros.')}>
      {painel && <Conteudo painel={painel} />}
    </TelaDePlanilha>
  )
}
