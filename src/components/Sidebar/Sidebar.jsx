import { Link, NavLink } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle'
import IdiomaToggle from '@/components/IdiomaToggle/IdiomaToggle'
import { Icone, IconeX } from '@/components/CrudCard/icones'
import { ROTULO_FUNCAO } from '@/modules/user/user.constants'
import { iniciais } from '@/utils/nome'
import Marca from './Marca'
import BotaoInstalar from './BotaoInstalar'
import { ICONES } from './menuIcones'
import { abasDoNegocio } from './abas'
import { useNegocio } from '@/hooks/useNegocio'
import './Sidebar.css'
import { tr } from '@/i18n';

const TODOS = ['super_admin', 'admin', 'membro']

function gruposDoMenu(negocio) {
    return [
        {
            titulo: tr('Planilha'),
            itens: abasDoNegocio(negocio).map((aba) => ({ ...aba, roles: TODOS })),
        },
        {
            titulo: tr('Ferramentas'),
            itens: [
                { label: tr('Buscar leads'), path: '/captacao', icone: 'captacao', roles: TODOS },
                { label: tr('Editar rotina'), path: '/rotina/editar', icone: 'rotina', roles: ['admin', 'super_admin'] },
                { label: tr('Remetentes de e-mail'), path: '/remetentes', icone: 'email', roles: ['admin', 'super_admin'] },
            ],
        },
        {
            titulo: tr('Conta'),
            itens: [
                { label: tr('Negócios'), path: '/negocios', icone: 'negocios', roles: TODOS },
                { label: tr('Contas'), path: '/contas', icone: 'empresas', roles: ['super_admin'] },
                { label: tr('Minha conta'), path: '/minha-conta', icone: 'usuarios', roles: TODOS },
            ],
        },
    ]
}

export function Sidebar({ aberto = false, onFechar }) {
    const { user, hasRole, logout } = useAuthContext()
    const { negocio } = useNegocio()

    async function handleLogout() {
        await logout()
    }

    const grupos = gruposDoMenu(negocio)
        .map((grupo) => ({ ...grupo, itens: grupo.itens.filter((item) => item.roles.some((role) => hasRole(role))) }))
        .filter((grupo) => grupo.itens.length > 0)

    return (
        <aside id="menu-principal" className={`sidebar${aberto ? ' is-aberto' : ''}`} aria-label={tr('Menu principal')}>
            <div className="sidebar__topo">
                <Link to="/home" className="marca-link" aria-label={tr('Ir para o início')} onClick={onFechar}>
                    <Marca empresa={negocio?.nome ?? user?.nomeEmpresa} />
                </Link>
                <button type="button" className="icon-btn sidebar__fechar" aria-label={tr('Fechar menu')} onClick={onFechar}>
                    <IconeX />
                </button>
            </div>

            <Link to="/negocios" className="sidebar__negocio" onClick={onFechar} aria-label={tr('Trocar de negócio')}>
                <span className="sidebar__negocio-textos">
                    <small>{tr('Negócio aberto')}</small>
                    <strong>{negocio?.nome ?? '…'}</strong>
                </span>
                <span className="sidebar__negocio-trocar">{tr('Trocar')}</span>
            </Link>

            <nav className="sidebar__nav">
                {grupos.map((grupo) => (
                    <div className="sidebar__grupo" key={grupo.titulo}>
                        <span className="sidebar__titulo">{grupo.titulo}</span>
                        <ul>
                            {grupo.itens.map((item) => (
                                <li key={item.path}>
                                    <NavLink to={item.path} className="sidebar__link" onClick={onFechar}>
                                        {item.cor
                                            ? <span className="sidebar__cor" style={{ background: item.cor }} aria-hidden="true" />
                                            : <Icone>{ICONES[item.icone]}</Icone>}
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar__rodape">
                <BotaoInstalar />

                <div className="sidebar__usuario">
                    <span className="sidebar__avatar" aria-hidden="true">{iniciais(user?.nomeCompleto)}</span>
                    <span className="sidebar__usuario-dados">
                        <strong>{user?.nomeCompleto}</strong>
                        <span>{ROTULO_FUNCAO[user?.role] ?? user?.role}</span>
                    </span>
                </div>

                <div className="sidebar__idioma">
                    <IdiomaToggle />
                </div>

                <div className="sidebar__acoes">
                    <ThemeToggle />
                    <button type="button" className="btn btn--ghost btn--sm sidebar__sair" onClick={handleLogout}>
                        <Icone>{ICONES.sair}</Icone>
                        {tr('Sair')}
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
