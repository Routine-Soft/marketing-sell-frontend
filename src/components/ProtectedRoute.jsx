import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/hooks/useAuthContext'

export function ProtectedRoute({ children, requiredRoles = [] }) {
    const { isAuthenticated, hasRole } = useAuthContext()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRoles.length > 0 && !requiredRoles.some((role) => hasRole(role))) {
        return <Navigate to="/home" replace />
    }

    return children
}

export default ProtectedRoute
