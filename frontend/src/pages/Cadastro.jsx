import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleCadastro(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      return setErro('Preencha todos os campos.')
    }

    if (senha !== confirmarSenha) {
      return setErro('As senhas não coincidem.')
    }

    if (senha.length < 6) {
      return setErro('A senha deve ter pelo menos 6 caracteres.')
    }

    setCarregando(true)

    try {
      await api.post('/usuarios', {
        nome: nome.trim(),
        email: email.trim(),
        senha
      })
      setSucesso('Cadastro realizado com sucesso!')
      setTimeout(() => navigate('/usuarios'), 1500)
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
    // min-vh-100 + p-3 evitam problemas com teclado móvel e dão margem de respiro
    <div className="d-flex justify-content-center align-items-center min-vh-100 p-3">
      {/* Modificado para <form> para aceitar envio com "Enter" e adicionado largura fluida */}
      <form
        className="card shadow p-4 text-center w-100"
        style={{ maxWidth: '400px' }}
        onSubmit={handleCadastro}
      >
        <h3>SCIJF</h3>
        <p className="text-muted">Criar nova conta</p>

        {erro && <div className="alert alert-danger py-2">{erro}</div>}
        {sucesso && <div className="alert alert-success py-2">{sucesso}</div>}

        <input
          className="form-control mb-3"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

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

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn btn-dark w-100 mb-3"
          disabled={carregando}
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-muted mb-0">
          Já tem conta?{' '}
          <Link to="/">Fazer login</Link>
        </p>
      </form>
    </div>
  )
}