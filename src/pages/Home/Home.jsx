import { Link } from 'react-router-dom'
import { Icone } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useAuthContext } from '@/hooks/useAuthContext'
import { useResumoDosLeads } from '@/modules/lead/lead.hooks'
import { localeAtual, tr } from '@/i18n'
import './Home.css'

const ICONE_EMAIL = (<><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 6L2 7" /></>)
const ICONE_TELEFONE = (<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />)
const ICONE_FILA = (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>)

export default function Home() {
  const { user } = useAuthContext()
  const { resumo, erro } = useResumoDosLeads()
  const primeiroNome = user?.nomeCompleto?.split(' ')[0] ?? ''

  const kpis = [
    { rotulo: tr('Leads'), valor: resumo?.total, icone: ICONES.leads, link: '/leads' },
    { rotulo: tr('Com e-mail'), valor: resumo?.comEmail, icone: ICONE_EMAIL, link: '/leads?comEmail=sim' },
    { rotulo: tr('Com telefone'), valor: resumo?.comTelefone, icone: ICONE_TELEFONE, link: '/leads?comTelefone=sim' },
    { rotulo: tr('Procurando e-mail'), valor: resumo?.naFila, icone: ICONE_FILA, link: '/leads' },
  ]

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">{tr('Olá, {nome}', { nome: primeiroNome })}</h2>
          <p className="page-subtitle">{tr('Um resumo da sua captação de clientes')}</p>
        </div>
        <div className="page-header__acoes">
          <Link className="btn btn--primary" to="/captacao">{tr('Nova busca')}</Link>
        </div>
      </header>

      {erro && <div className="alerts"><p className="alert alert--error" role="alert">{erro.message}</p></div>}

      <div className="kpis stagger">
        {kpis.map((kpi) => (
          <Link key={kpi.rotulo} to={kpi.link} className="card kpi">
            <span className="kpi__icone" aria-hidden="true"><Icone>{kpi.icone}</Icone></span>
            <span className="kpi__rotulo">{kpi.rotulo}</span>
            {resumo ? (
              <strong className="kpi__valor">{kpi.valor.toLocaleString(localeAtual())}</strong>
            ) : (
              <span className="skeleton skeleton--line kpi__skeleton" aria-label={tr('Carregando')} />
            )}
          </Link>
        ))}
      </div>

      <section className="card form-card home-passos">
        <h3 className="form-card__title">{tr('Como funciona')}</h3>
        <ol className="passos">
          <li><strong>{tr('Escolha a fonte')}</strong><span>{tr('Profissionais de saúde (NPI), Google Maps, empresas recém-abertas ou prestadores licenciados.')}</span></li>
          <li><strong>{tr('Filtre e busque')}</strong><span>{tr('Por especialidade, nicho, cidade e estado. Os leads entram na sua lista sem repetir.')}</span></li>
          <li><strong>{tr('Complete e exporte')}</strong><span>{tr('Procure o e-mail no site de cada empresa, marque a situação e exporte a planilha.')}</span></li>
        </ol>
      </section>
    </div>
  )
}
