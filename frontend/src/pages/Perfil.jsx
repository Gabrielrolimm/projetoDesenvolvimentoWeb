import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

export default function Perfil() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario'))

    if (!usuarioSalvo) {
      navigate('/')
      return
    }

    async function carregarPerfil() {
      try {
        const response = await api.get(`/perfil/${usuarioSalvo.id}`)
        setNome(response.data.nome)
        setEmail(response.data.email)
      } catch (error) {
        setErro('Erro ao carregar perfil.')
      }
    }

    carregarPerfil()
  }, [])

  async function handleSalvar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (novaSenha && novaSenha !== confirmarSenha) {
      setErro('As novas senhas não coincidem.')
      return
    }

    const usuarioSalvo = JSON.parse(localStorage.getItem('usuario'))
    setCarregando(true)

    try {
      const response = await api.put(`/perfil/${usuarioSalvo.id}`, {
        nome,
        email,
        senhaAtual: senhaAtual || undefined,
        novaSenha: novaSenha || undefined,
      })

      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))

      setSucesso('Perfil atualizado com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
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

  function handleSair() {
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar fixa */}
      <Sidebar />

      {/* Conteúdo principal com scroll */}
      <div
        className="main-content flex-grow-1"
        style={{
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa',
        }}
      >
        {/* Topbar */}
        <div
          className="topbar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          Meu Perfil
        </div>

        {/* Área do formulário (SEM centralização vertical) */}
        <div className="container py-4 d-flex justify-content-center">
          
          <div className="card shadow-sm p-4" style={{ width: '420px' }}>

            <h4 className="text-center mb-4">Informações do Perfil</h4>

            {erro && (
              <div className="alert alert-danger py-2">{erro}</div>
            )}

            {sucesso && (
              <div className="alert alert-success py-2">{sucesso}</div>
            )}

            {/* Nome */}
            <div className="mb-3">
              <label className="form-label">Nome</label>
              <input
                className="form-control"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <hr />

            <h5 className="text-center">Alterar Senha</h5>

            <p className="text-muted text-center" style={{ fontSize: '13px' }}>
              Preencha apenas se quiser alterar a senha
            </p>

            {/* Senha atual */}
            <div className="mb-3">
              <label className="form-label">Senha atual</label>
              <input
                type="password"
                className="form-control"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />
            </div>

            {/* Nova senha */}
            <div className="mb-3">
              <label className="form-label">Nova senha</label>
              <input
                type="password"
                className="form-control"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>

            {/* Confirmar senha */}
            <div className="mb-3">
              <label className="form-label">Confirmar nova senha</label>
              <input
                type="password"
                className="form-control"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>

            {/* Botão salvar */}
            <button
              className="btn btn-dark w-100 mb-3"
              onClick={handleSalvar}
              disabled={carregando}
            >
              {carregando ? 'Salvando...' : 'Salvar alterações'}
            </button>

            <hr/>

            {/* Logout */}
            <button
              className="btn btn-danger w-100"
              onClick={handleSair}
            >
              Sair da conta
            </button>

            <hr/>

          </div>
        </div>
      </div>
    </div>
  )
}