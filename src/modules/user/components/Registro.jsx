import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import AuthLayout from './AuthLayout'
import CampoSenha from '@/components/CampoSenha/CampoSenha'
import { normalizarEmail } from '@/utils/email'
import { tr } from '@/i18n'

// Cria a conta da empresa: quem cadastra vira o administrador.
export default function Registro() {
  const { isAuthenticated, loading, error, registrar } = useAuthContext()
  const [form, setForm] = useState({ nomeCompleto: '', nomeEmpresa: '', email: '', telefone: '', password: '' })

  if (isAuthenticated) return <Navigate to="/home" replace />

  function mudar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await registrar(form)
    } catch {
      // a mensagem aparece pelo `error` do contexto; com a sessão aberta, o <Navigate> leva ao início
    }
  }

  return (
    <AuthLayout>
      <h2 className="auth-title">{tr('Criar conta')}</h2>
      <p className="auth-subtitle">{tr('Cadastre sua empresa para começar')}</p>

      <form className="auth-form stagger" onSubmit={handleSubmit}>
        {error && <p className="alert alert--error" role="alert">{error.message}</p>}

        <div className="field">
          <label className="field__label" htmlFor="registro-nome">{tr('Nome completo')}</label>
          <input id="registro-nome" className="input" autoComplete="name" value={form.nomeCompleto}
            onChange={(e) => mudar('nomeCompleto', e.target.value)} required />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="registro-empresa">{tr('Nome da empresa')}</label>
          <input id="registro-empresa" className="input" autoComplete="organization" value={form.nomeEmpresa}
            onChange={(e) => mudar('nomeEmpresa', e.target.value)} required />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="registro-email">{tr('E-mail')}</label>
          <input id="registro-email" className="input" type="email" autoComplete="email" value={form.email}
            onChange={(e) => mudar('email', normalizarEmail(e.target.value))} placeholder={tr('seu@email.com')} required />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="registro-telefone">{tr('Telefone (opcional)')}</label>
          <input id="registro-telefone" className="input" type="tel" autoComplete="tel" value={form.telefone}
            onChange={(e) => mudar('telefone', e.target.value)} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="registro-senha">{tr('Senha')}</label>
          <CampoSenha id="registro-senha" autoComplete="new-password" minLength={6} value={form.password}
            onChange={(e) => mudar('password', e.target.value)} placeholder={tr('Pelo menos 6 caracteres')} required />
        </div>

        <button className={`btn btn--primary${loading ? ' btn--loading' : ''}`} type="submit" disabled={loading}>
          {loading ? tr('Criando...') : tr('Criar conta')}
        </button>
      </form>

      <p className="auth-footer">
        {tr('Já tem uma conta?')} <Link className="link" to="/login">{tr('Entrar')}</Link>
      </p>
    </AuthLayout>
  )
}
