import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const isAdmin = usuario?.perfil === 'admin'

  return (
    <div className="sidebar p-3">
      <h4>SCIJF</h4>

      <ul className="nav flex-column mt-4">
        <li className="nav-item">
          <NavLink className="nav-link" to="/chat">
            Conversas
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link" to="/comunicados">
            Comunicados
          </NavLink>
        </li>

        {/* Visível apenas para admins */}
        {isAdmin && (
          <li className="nav-item">
            <NavLink className="nav-link" to="/usuarios">
              Usuários
            </NavLink>
          </li>
        )}

        <li className="nav-item">
          <NavLink className="nav-link" to="/perfil">
            Perfil
          </NavLink>
        </li>
      </ul>
    </div>
  )
}