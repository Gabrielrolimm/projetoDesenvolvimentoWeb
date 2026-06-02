import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  if (!token || !usuario) {
    return <Navigate to="/" replace />
  }

  if (usuario.perfil !== 'admin') {
    return <Navigate to="/chat" replace />
  }

  return children
}