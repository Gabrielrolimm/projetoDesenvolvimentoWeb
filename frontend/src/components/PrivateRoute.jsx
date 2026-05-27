import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  const usuario = localStorage.getItem('usuario')

  if (!token || !usuario) {
    return <Navigate to="/" replace />
  }

  return children
}