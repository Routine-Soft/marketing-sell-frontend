import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'
import AuthLayout from './AuthLayout'
import CampoSenha from '@/components/CampoSenha/CampoSenha'
import { normalizarEmail } from '@/utils/email'
import { tr } from '@/i18n'

export default function Login() {
  const { isAuthenticated, loading, error, login } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) return <Navigate to="/home" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(email, password)
    } catch {
      // a mensagem aparece pelo `error` do contexto; com a sessão aberta, o <Navigate> leva ao início
    }
  }

  return (
    <AuthLayout>
      <h2 className="auth-title">{tr('Entrar')}</h2>
      <p className="auth-subtitle">{tr('Acesse sua conta para captar novos clientes')}</p>

      <form className="auth-form stagger" onSubmit={handleSubmit}>
        {error && <p className="alert alert--error" role="alert">{error.message}</p>}

        <div className="field">
          <label className="field__label" htmlFor="login-email">{tr('E-mail')}</label>
          <input id="login-email" className="input" type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(normalizarEmail(e.target.value))} placeholder={tr('seu@email.com')} required />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="login-senha">{tr('Senha')}</label>
          <CampoSenha id="login-senha" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        <button className={`btn btn--primary${loading ? ' btn--loading' : ''}`} type="submit" disabled={loading}>
          {loading ? tr('Entrando...') : tr('Entrar')}
        </button>
      </form>

      <p className="auth-footer">
        {tr('Ainda não tem uma conta?')} <Link className="link" to="/registro">{tr('Criar conta')}</Link>
      </p>
    </AuthLayout>
  )
}
