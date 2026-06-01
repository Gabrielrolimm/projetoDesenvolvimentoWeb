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

    // Validação básica antes de enviar a requisição
    if (!email.trim() || !senha.trim()) {
      return setErro('Por favor, preencha todos os campos.')
    }

    setErro('')
    setCarregando(true)

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        senha,
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))

      navigate('/chat')
    } catch (error) {
      if (error.response?.data?.mensagem) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao conectar com o servidor.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    // min-vh-100 impede problemas com o teclado do mobile; p-3 adiciona margem de respiro nas bordas
    <div className="d-flex justify-content-center align-items-center min-vh-100 p-3">

      {/* Trocamos a largura fixa por classes fluidas do Bootstrap + maxWidth */}
      <form
        className="card shadow p-4 text-center w-100"
        style={{ maxWidth: '380px' }}
        onSubmit={handleLogin}
      >
        <h3>SCIJF</h3>

        <p className="text-muted">
          Sistema de Comunicação Interna
        </p>

        {erro && (
          <div className="alert alert-danger py-2" role="alert">
            {erro}
          </div>
        )}

        <input
          type="email"
          className="form-control mb-3"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn btn-dark w-100"
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}