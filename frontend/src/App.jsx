import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Chat from './pages/Chat'
import Comunicados from './pages/Comunicados'
import Usuarios from './pages/Usuarios'
import Perfil from './pages/Perfil'
import AdminRoute from './components/AdminRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas — acessíveis sem login */}
        <Route path="/"         element={<Login />} />

        {/* Rotas privadas — exigem login */}
        <Route path="/cadastro" element={
          <AdminRoute><Cadastro /></AdminRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute><Chat /></PrivateRoute>
        } />
        <Route path="/comunicados" element={
          <PrivateRoute><Comunicados /></PrivateRoute>
        } />
        <Route path="/usuarios" element={
          <AdminRoute><Usuarios /></AdminRoute>
        } />
        <Route path="/perfil" element={
          <PrivateRoute><Perfil /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}