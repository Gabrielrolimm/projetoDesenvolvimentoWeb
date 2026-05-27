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

    if (!nome || !email || !senha || !confirmarSenha) {
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
      await api.post('/usuarios', { nome, email, senha })
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
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 text-center" style={{ width: '400px' }}>
        <h3>SCIJF</h3>
        <p className="text-muted">Criar nova conta</p>

        {erro && (
          <div className="alert alert-danger py-2">{erro}</div>
        )}

        {sucesso && (
          <div className="alert alert-success py-2">{sucesso}</div>
        )}

        <input
          className="form-control mb-3"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

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

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <button
          onClick={handleCadastro}
          className="btn btn-dark w-100 mb-3"
          disabled={carregando}
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-muted mb-0">
          Já tem conta?{' '}
          <Link to="/">Fazer login</Link>
        </p>
      </div>
    </div>
  )
}