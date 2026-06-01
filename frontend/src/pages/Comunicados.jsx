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

    if (!titulo.trim() || !conteudo.trim()) {
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
    // min-vh-100 garante o preenchimento vertical correto
    <div className="d-flex min-vh-100">
      <Sidebar />

      {/* overflow-hidden e flex-column evitam quebras de estrutura lateral com o Sidebar */}
      <div className="main-content flex-grow-1 d-flex flex-column" style={{ overflowX: 'hidden' }}>
        <div className="topbar">Comunicados</div>

        {/* p-3 ou p-md-4 adicionam espaçamentos confortáveis que adaptam ao mobile */}
        <div className="container-fluid p-3 p-md-4">

          {erro && <div className="alert alert-danger py-2">{erro}</div>}
          {sucesso && <div className="alert alert-success py-2">{sucesso}</div>}

          {isAdmin && (
            <div className="mb-4">
              <button
                className="btn btn-dark"
                onClick={() => setMostrarForm(!mostrarForm)}
              >
                {mostrarForm ? 'Cancelar' : '+ Novo Comunicado'}
              </button>

              {mostrarForm && (
                /* Mudamos de <div> para <form> com onSubmit para aceitar envio pelo teclado */
                <form className="card mt-3 p-3 shadow-sm" onSubmit={publicar}>
                  <h5>Novo Comunicado</h5>

                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                      className="form-control"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Conteúdo</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={conteudo}
                      onChange={(e) => setConteudo(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-dark">
                    Publicar
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="row">
            <div className="col-12">
              {carregando ? (
                <p className="text-muted">Carregando comunicados...</p>
              ) : comunicados.length === 0 ? (
                <p className="text-muted">Nenhum comunicado publicado ainda.</p>
              ) : (
                comunicados.map((c) => (
                  <div key={c.id} className="card mb-3 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        {/* text-break impede títulos absurdamente longos de estourarem a largura */}
                        <h5 className="mb-1 text-break">{c.titulo}</h5>
                        {isAdmin && (
                          <button
                            className="btn btn-sm btn-outline-danger flex-shrink-0"
                            onClick={() => remover(c.id)}
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      {/* Adicionado a classe CSS inline 'whiteSpace: pre-wrap' para respeitar os parágrafos digitados */}
                      <p className="mt-2 text-break" style={{ whiteSpace: 'pre-wrap' }}>
                        {c.conteudo}
                      </p>

                      <small className="text-muted d-block mt-2">
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
      </div>
    </div>
  )
}