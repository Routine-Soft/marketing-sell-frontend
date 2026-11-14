import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import NegocioProvider from '@/context/NegocioProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import Login from '@/modules/user/components/Login'
import Registro from '@/modules/user/components/Registro'
import MinhaConta from '@/modules/user/components/MinhaConta'
import ContasADM from '@/modules/user/components/ContasADM'
import Captacao from '@/modules/captacao/components/Captacao'
import Leads from '@/modules/lead/components/Leads'
import RotinaDiaria from '@/modules/rotina/components/RotinaDiaria'
import Painel from '@/modules/rotina/components/Painel'
import Parceiros from '@/modules/parceiro/components/Parceiros'
import Comunidades from '@/modules/comunidade/components/Comunidades'
import Preparacao from '@/modules/checklist/components/Preparacao'
import Anuncios from '@/modules/checklist/components/Anuncios'
import Negocios from '@/modules/negocio/components/Negocios'
import Ideias from '@/modules/ideia/components/Ideias'
import EditarRotina from '@/modules/rotina/components/EditarRotina'
import Remetentes from '@/modules/remetente/components/Remetentes'

function Protegida({ roles, children }) {
  return (
    <ProtectedRoute requiredRoles={roles}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NegocioProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            <Route path="/home" element={<Protegida><RotinaDiaria /></Protegida>} />
            <Route path="/negocios" element={<Protegida><Negocios /></Protegida>} />
            <Route path="/rotina/editar" element={<Protegida roles={['admin', 'super_admin']}><EditarRotina /></Protegida>} />
            <Route path="/ideias-video" element={<Protegida><Ideias key="video" tipo="video" /></Protegida>} />
          <Route path="/ideias-artigo" element={<Protegida><Ideias key="artigo" tipo="artigo" /></Protegida>} />
          <Route path="/painel" element={<Protegida><Painel /></Protegida>} />
            <Route path="/parceiros" element={<Protegida><Parceiros /></Protegida>} />
            <Route path="/preparacao" element={<Protegida><Preparacao /></Protegida>} />
            <Route path="/comunidades" element={<Protegida><Comunidades /></Protegida>} />
            <Route path="/anuncios" element={<Protegida><Anuncios /></Protegida>} />
            <Route path="/captacao" element={<Protegida><Captacao /></Protegida>} />
            <Route path="/leads" element={<Protegida><Leads /></Protegida>} />
            <Route path="/remetentes" element={<Protegida roles={['admin', 'super_admin']}><Remetentes /></Protegida>} />
            <Route path="/minha-conta" element={<Protegida><MinhaConta /></Protegida>} />
            <Route path="/contas" element={<Protegida roles={['super_admin']}><ContasADM /></Protegida>} />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </NegocioProvider>
    </AuthProvider>
  )
}
