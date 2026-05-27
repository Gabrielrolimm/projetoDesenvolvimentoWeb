import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [editando, setEditando] = useState(null)

  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const isAdmin = usuario?.perfil === 'admin'

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    try {
      const response = await api.get('/usuarios')
      setUsuarios(response.data)
    } catch (error) {
      setErro('Erro ao carregar usuários.')
    } finally {
      setCarregando(false)
    }
  }

  async function salvarEdicao() {
    setSucesso('')
    setErro('')

    try {
      await api.put(`/usuarios/${editando.id}`, {
        nome: editando.nome,
        email: editando.email,
        perfil_id: editando.perfil === 'admin' ? 1 : 2,
        ativo: editando.ativo,
      })

      setSucesso('Usuário atualizado com sucesso!')
      setEditando(null)
      carregarUsuarios()
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao atualizar usuário.')
      }
    }
  }

  async function desativar(id) {
    if (!confirm('Deseja desativar este usuário?')) return
    setSucesso('')
    setErro('')

    try {
      await api.delete(`/usuarios/${id}`)
      setSucesso('Usuário desativado.')
      carregarUsuarios()
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao desativar usuário.')
      }
    }
  }

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="main-content flex-grow-1">
        <div className="topbar">Gerenciamento de Usuários</div>

        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Lista de usuários</h5>
          <a href="/cadastro" className="btn btn-dark btn-sm">
            + Novo usuário
          </a>
        </div>

          {erro && <div className="alert alert-danger">{erro}</div>}
          {sucesso && <div className="alert alert-success">{sucesso}</div>}

          {carregando ? (
            <p className="text-muted">Carregando usuários...</p>
          ) : (
            <table className="table table-hover shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  {isAdmin && <th>Ações</th>}
                </tr>
              </thead>

              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {isAdmin && editando?.id === u.id ? (
                        <input
                          className="form-control form-control-sm"
                          value={editando.nome}
                          onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                        />
                      ) : u.nome}
                    </td>

                    <td>
                      {isAdmin && editando?.id === u.id ? (
                        <input
                          className="form-control form-control-sm"
                          value={editando.email}
                          onChange={(e) => setEditando({ ...editando, email: e.target.value })}
                        />
                      ) : u.email}
                    </td>

                    <td>
                      {isAdmin && editando?.id === u.id ? (
                        <select
                          className="form-select form-select-sm"
                          value={editando.perfil}
                          onChange={(e) => setEditando({ ...editando, perfil: e.target.value })}
                        >
                          <option value="usuario">Usuário</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : u.perfil}
                    </td>

                    <td>
                      {isAdmin && editando?.id === u.id ? (
                        <select
                          className="form-select form-select-sm"
                          value={editando.ativo ? 'true' : 'false'}
                          onChange={(e) => setEditando({ ...editando, ativo: e.target.value === 'true' })}
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      ) : (
                        <span className={`badge ${u.ativo ? 'bg-success' : 'bg-secondary'}`}>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td>
                        {editando?.id === u.id ? (
                          <>
                            <button className="btn btn-sm btn-success me-1" onClick={salvarEdicao}>
                              Salvar
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditando(null)}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => setEditando({ ...u })}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => desativar(u.id)}
                              disabled={!u.ativo}
                            >
                              Desativar
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}