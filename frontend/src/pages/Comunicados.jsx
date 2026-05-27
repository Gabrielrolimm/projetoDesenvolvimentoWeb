import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function Comunicados() {
  const [comunicados, setComunicados] = useState([])
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const isAdmin = usuario?.perfil === 'admin'

  useEffect(() => {
    carregarComunicados()
  }, [])

  async function carregarComunicados() {
    try {
      const response = await api.get('/comunicados')
      setComunicados(response.data)
    } catch (error) {
      setErro('Erro ao carregar comunicados.')
    } finally {
      setCarregando(false)
    }
  }

  async function publicar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!titulo || !conteudo) {
      return setErro('Título e conteúdo são obrigatórios.')
    }

    try {
      await api.post('/comunicados', { titulo, conteudo })
      setSucesso('Comunicado publicado com sucesso!')
      setTitulo('')
      setConteudo('')
      setMostrarForm(false)
      carregarComunicados()
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao publicar comunicado.')
      }
    }
  }

  async function remover(id) {
    if (!confirm('Deseja remover este comunicado?')) return
    setErro('')
    setSucesso('')

    try {
      await api.delete(`/comunicados/${id}`)
      setSucesso('Comunicado removido.')
      setComunicados((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao remover comunicado.')
      }
    }
  }

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="main-content flex-grow-1">
        <div className="topbar">Comunicados</div>

        <div className="container mt-4">

          {erro && <div className="alert alert-danger">{erro}</div>}
          {sucesso && <div className="alert alert-success">{sucesso}</div>}

          {isAdmin && (
            <div className="mb-4">
              <button
                className="btn btn-dark"
                onClick={() => setMostrarForm(!mostrarForm)}
              >
                {mostrarForm ? 'Cancelar' : '+ Novo Comunicado'}
              </button>

              {mostrarForm && (
                <div className="card mt-3 p-3 shadow-sm">
                  <h5>Novo Comunicado</h5>

                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                      className="form-control"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Conteúdo</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={conteudo}
                      onChange={(e) => setConteudo(e.target.value)}
                    />
                  </div>

                  <button className="btn btn-dark" onClick={publicar}>
                    Publicar
                  </button>
                </div>
              )}
            </div>
          )}

          {carregando ? (
            <p className="text-muted">Carregando comunicados...</p>
          ) : comunicados.length === 0 ? (
            <p className="text-muted">Nenhum comunicado publicado ainda.</p>
          ) : (
            comunicados.map((c) => (
              <div key={c.id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="mb-1">{c.titulo}</h5>
                    {isAdmin && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remover(c.id)}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="mt-2">{c.conteudo}</p>
                  <small className="text-muted">
                    Publicado por {c.autor_nome} em{' '}
                    {new Date(c.publicado_em).toLocaleDateString('pt-BR')}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}