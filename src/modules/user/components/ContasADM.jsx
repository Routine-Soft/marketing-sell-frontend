import { useState } from 'react'
import Modal from '@/components/Modal/Modal'
import ModalForm from '@/components/Modal/ModalForm'
import EstadoVazio from '@/components/EstadoVazio/EstadoVazio'
import ConfirmarNoLugar from '@/components/ConfirmarNoLugar/ConfirmarNoLugar'
import { IconeBusca, IconeLapis } from '@/components/CrudCard/icones'
import { ICONES } from '@/components/Sidebar/menuIcones'
import { useContasAdmin } from '../user.hooks'
import { iniciais } from '@/utils/nome'
import { localeAtual, tr } from '@/i18n'
import './contas-adm.css'

function CotaModal({ conta, cotaPadrao, erro, onSalvar, onClose }) {
  const [cota, setCota] = useState(conta.cotaGoogleMensal ?? '')
  return (
    <Modal title={tr('Cota do Google: {empresa}', { empresa: conta.nomeEmpresa })} onClose={onClose}>
      {(fechar) => (
        <ModalForm erro={erro} fechar={fechar} onSubmit={() => onSalvar(conta._id, cota === '' ? null : cota)}>
          <div className="field">
            <label className="field__label" htmlFor="cota-google">{tr('Páginas de busca por mês')}</label>
            <input id="cota-google" className="input" type="number" min="0" inputMode="numeric" value={cota}
              onChange={(e) => setCota(e.target.value)} placeholder={String(cotaPadrao)} />
          </div>
          <p className="modal-form__hint">
            {tr('Cada página traz até 20 empresas e é cobrada pelo Google. Deixe vazio para usar o padrão do sistema ({padrao}).', { padrao: cotaPadrao })}
          </p>
        </ModalForm>
      )}
    </Modal>
  )
}

export default function ContasADM() {
  const { contas, cotaPadrao, loading, erro, sucesso, salvarCota, excluir } = useContasAdmin()
  const [busca, setBusca] = useState('')
  const [editandoCota, setEditandoCota] = useState(null)

  const termo = busca.trim().toLowerCase()
  const visiveis = termo
    ? contas.filter((c) => [c.nomeEmpresa, c.nomeCompleto, c.email].some((v) => v?.toLowerCase().includes(termo)))
    : contas

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2 className="page-title">
            {tr('Contas')} <span className="badge badge--primary">{contas.length === 1 ? tr('1 conta') : tr('{n} contas', { n: contas.length })}</span>
          </h2>
          <p className="page-subtitle">{tr('Empresas que usam o sistema e o uso do Google neste mês')}</p>
        </div>
      </header>

      {(sucesso || (erro && !editandoCota)) && (
        <div className="alerts">
          {erro && !editandoCota && <p className="alert alert--error" role="alert">{erro.message}</p>}
          {sucesso && <p className="alert alert--success" role="status">{sucesso}</p>}
        </div>
      )}

      <section className="card contas-adm">
        <label className="search contas-adm__busca">
          <IconeBusca />
          <input className="input" type="search" value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder={tr('Buscar por empresa, nome ou e-mail')} aria-label={tr('Buscar contas')} />
        </label>

        {loading ? (
          <div className="contas-adm__skeleton" aria-busy="true" aria-label={tr('Carregando')}>
            {[0, 1, 2].map((i) => <div key={i} className="skeleton skeleton--line" style={{ height: 56 }} />)}
          </div>
        ) : visiveis.length === 0 ? (
          <EstadoVazio icone={ICONES.empresas} titulo={termo ? tr('Nenhuma conta encontrada') : tr('Nenhuma conta ainda')}
            texto={termo ? tr('Tente buscar com outras palavras.') : tr('As empresas aparecem aqui quando criam a conta.')} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{tr('Conta')}</th>
                  <th>{tr('Contato')}</th>
                  <th>{tr('Uso')}</th>
                  <th>{tr('Ações')}</th>
                </tr>
              </thead>
              <tbody className="stagger">
                {visiveis.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="contas-adm__conta">
                        <span className="sidebar__avatar" aria-hidden="true">{iniciais(c.nomeEmpresa)}</span>
                        <span>
                          <strong>{c.nomeEmpresa}</strong>
                          <small>{c.nomeCompleto} · {tr('desde {data}', { data: new Date(c.createdAt).toLocaleDateString(localeAtual()) })}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="contas-adm__email">{c.email}</span>
                      {c.telefone && <a className="link" href={`tel:${c.telefone}`}>{c.telefone}</a>}
                    </td>
                    <td>
                      <span>{tr('{n} leads', { n: c.leads.toLocaleString(localeAtual()) })}</span>
                      <small className={c.googleUsadoNoMes >= c.cotaGoogle ? 'contas-adm__cota--cheia' : ''}>
                        {tr('Google: {usado} de {limite} páginas', { usado: c.googleUsadoNoMes, limite: c.cotaGoogle })}
                      </small>
                    </td>
                    <td>
                      <div className="table__actions">
                        <button type="button" className="icon-btn" aria-label={tr('Editar cota do Google')} title={tr('Editar cota do Google')}
                          onClick={() => setEditandoCota(c)}>
                          <IconeLapis />
                        </button>
                        <ConfirmarNoLugar rotulo={tr('Excluir conta')} pergunta={tr('Excluir?')} onConfirmar={() => excluir(c._id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="contas-adm__nota">{tr('Excluir uma conta apaga os usuários, os leads, o histórico de buscas, os remetentes e os e-mails enviados dela. Não tem como desfazer.')}</p>
      </section>

      {editandoCota && (
        <CotaModal conta={editandoCota} cotaPadrao={cotaPadrao} erro={erro} onSalvar={salvarCota} onClose={() => setEditandoCota(null)} />
      )}
    </div>
  )
}
