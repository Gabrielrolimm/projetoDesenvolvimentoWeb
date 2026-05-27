import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  if (!usuario || usuario.perfil !== 'admin') {
    return <Navigate to="/chat" replace />
  }

  return children
}