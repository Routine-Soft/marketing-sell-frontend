import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/layouts/MainLayout'
import Login from '@/modules/user/components/Login'
import Registro from '@/modules/user/components/Registro'
import MinhaConta from '@/modules/user/components/MinhaConta'
import ContasADM from '@/modules/user/components/ContasADM'
import Captacao from '@/modules/captacao/components/Captacao'
import Leads from '@/modules/lead/components/Leads'
import Remetentes from '@/modules/remetente/components/Remetentes'
import Home from '@/pages/Home/Home'

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
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/home" element={<Protegida><Home /></Protegida>} />
          <Route path="/captacao" element={<Protegida><Captacao /></Protegida>} />
          <Route path="/leads" element={<Protegida><Leads /></Protegida>} />
          <Route path="/remetentes" element={<Protegida roles={['admin', 'super_admin']}><Remetentes /></Protegida>} />
          <Route path="/minha-conta" element={<Protegida><MinhaConta /></Protegida>} />
          <Route path="/contas" element={<Protegida roles={['super_admin']}><ContasADM /></Protegida>} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
