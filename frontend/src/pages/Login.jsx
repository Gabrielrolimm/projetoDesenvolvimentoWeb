import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await api.post('/auth/login', { email, senha })

      // Salva o usuário no localStorage para usar nas outras páginas
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))

      navigate('/chat')
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao conectar com o servidor.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 text-center" style={{ width: '380px' }}>
        <img
          src="/images/logo.png"
          alt="Logo SCIJF"
          className="mb-3 d-block mx-auto"
          style={{ width: '150px' }}
        />

        <h3>SCIJF</h3>
        <p className="text-muted">Sistema de Comunicação Interna</p>

        {erro && (
          <div className="alert alert-danger py-2" role="alert">
            {erro}
          </div>
        )}

        <input
          className="form-control mb-3"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="btn btn-dark w-100"
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}