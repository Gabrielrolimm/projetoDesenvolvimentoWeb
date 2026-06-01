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

    // Validação básica simples antes do envio
    if (!editando.nome.trim() || !editando.email.trim()) {
      return setErro('Nome e e-mail não podem ficar vazios.')
    }

    try {
      await api.put(`/usuarios/${editando.id}`, {
        nome: editando.nome.trim(),
        email: editando.email.trim(),
        perfil: editando.perfil,
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
    <div className="d-flex min-vh-100">
      <Sidebar />

      {/* overflow-hidden e flex-column previnem que o conteúdo lateral empurre ou quebre a viewport */}
      <div className="main-content flex-grow-1 d-flex flex-column" style={{ overflowX: 'hidden' }}>
        <div className="topbar">Gerenciamento de Usuários</div>

        {/* p-3 e p-md-4 adaptam a área útil conforme o tamanho do dispositivo */}
        <div className="container-fluid p-3 p-md-4">

          {/* O container interno d-flex flex-column flex-sm-row reorganiza o título e botão verticalmente em telas menores */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
            <h5 className="mb-0">Lista de usuários</h5>
            <a href="/cadastro" className="btn btn-dark btn-sm w-100 w-sm-auto text-center">
              + Novo usuário
            </a>
          </div>

          {erro && <div className="alert alert-danger py-2">{erro}</div>}
          {sucesso && <div className="alert alert-success py-2">{sucesso}</div>}

          {carregando ? (
            <p className="text-muted">Carregando usuários...</p>
          ) : (
            /* O wrapper "table-responsive" isola a rolagem apenas na tabela em dispositivos mobile, preservando o layout do app */
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-hover align-middle mb-0">
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
                      {/* Classes text-break e min-width estilizadas previnem compressão exagerada de texto */}
                      <td className="text-break" style={{ minWidth: '160px' }}>
                        {isAdmin && editando?.id === u.id ? (
                          <input
                            className="form-control form-control-sm"
                            value={editando.nome}
                            onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                            required
                          />
                        ) : u.nome}
                      </td>

                      <td className="text-break" style={{ minWidth: '180px' }}>
                        {isAdmin && editando?.id === u.id ? (
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            value={editando.email}
                            onChange={(e) => setEditando({ ...editando, email: e.target.value })}
                            required
                          />
                        ) : u.email}
                      </td>

                      <td style={{ minWidth: '120px' }}>
                        {isAdmin && editando?.id === u.id ? (
                          <select
                            className="form-select form-select-sm"
                            value={editando.perfil}
                            onChange={(e) => setEditando({ ...editando, perfil: e.target.value })}
                          >
                            <option value="usuario">Usuário</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="text-capitalize">{u.perfil}</span>
                        )}
                      </td>

                      <td style={{ minWidth: '110px' }}>
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
                        /* d-flex e gap-1 asseguram o alinhamento adequado dos botões de ação na célula */
                        <td style={{ minWidth: '160px' }}>
                          <div className="d-flex gap-1">
                            {editando?.id === u.id ? (
                              <>
                                <button className="btn btn-sm btn-success" onClick={salvarEdicao}>
                                  Salvar
                                </button>
                                <button className="btn btn-sm btn-secondary" onClick={() => setEditando(null)}>
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary"
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
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}