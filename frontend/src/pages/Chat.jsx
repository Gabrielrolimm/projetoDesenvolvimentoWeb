import { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import api, { getDownloadUrl } from '../services/api'

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

const TAMANHO_MAXIMO = 10 * 1024 * 1024 // 10MB

export default function Chat() {
  const [conversas, setConversas] = useState([])
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [conversaSelecionada, setConversaSelecionada] = useState(null)
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarNovaConversa, setMostrarNovaConversa] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [buscaUsuario, setBuscaUsuario] = useState('')
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null)
  const mensagensEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const isAdmin = usuario?.perfil === 'admin'

  useEffect(() => { carregarConversas() }, [])

  useEffect(() => {
    if (!conversaSelecionada) return
    setErro('')
    carregarHistorico()
  }, [conversaSelecionada])

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  async function carregarConversas() {
    try {
      const response = await api.get(`/mensagens/conversas/${usuario.id}`)
      setConversas(response.data)
    } catch (error) {
      setErro('Erro ao carregar conversas.')
    }
  }

  async function carregarHistorico() {
    setCarregando(true)
    try {
      const response = await api.get(`/mensagens/historico/${conversaSelecionada.conversa_id}`)
      setMensagens(response.data)
      setConversas((prev) =>
        prev.map((c) =>
          c.conversa_id === conversaSelecionada.conversa_id ? { ...c, nao_lidas: 0 } : c
        )
      )
    } catch (error) {
      setErro('Erro ao carregar mensagens.')
    } finally {
      setCarregando(false)
    }
  }

  async function abrirNovaConversa() {
    try {
      const response = await api.get('/usuarios')
      setUsuarios(response.data.filter((u) => u.id !== usuario.id))
      setMostrarNovaConversa(true)
      setBuscaUsuario('')
    } catch (error) {
      setErro('Erro ao carregar usuários.')
    }
  }

  async function iniciarConversa(contato) {
    setErro('')
    setMostrarNovaConversa(false)

    const jaExiste = conversas.find((c) => c.contatoId === contato.id)

    if (jaExiste) {
      setConversaSelecionada(jaExiste)
      return
    }

    try {
      const response = await api.post('/mensagens', {
        destinatario_id: contato.id,
        conteudo: '👋',
      })

      const mensagemCriada = response.data

      const novaConversa = {
        conversa_id: mensagemCriada.conversa_id,
        contatoId: contato.id,
        nome: contato.nome,
        email: contato.email,
        ultimaMensagem: mensagemCriada.conteudo,
        ultimoEnvio: mensagemCriada.enviado_em,
        nao_lidas: 0,
      }

      setConversas((prev) => [novaConversa, ...prev])
      setConversaSelecionada(novaConversa)
      setMensagens([mensagemCriada])
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error)

      if (error.response?.data?.mensagem) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao iniciar conversa.')
      }
    }
  }

  function selecionarArquivo(e) {
    const arquivo = e.target.files[0]
    if (!arquivo) return

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      setErro('Formato não permitido. Use PDF, DOCX, imagens ou ZIP.')
      fileInputRef.current.value = ''
      return
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('Arquivo muito grande. Tamanho máximo: 10MB.')
      fileInputRef.current.value = ''
      return
    }

    setErro('')
    setArquivoSelecionado(arquivo)
  }

  async function enviarMensagem() {
    if (!novaMensagem.trim() && !arquivoSelecionado) return
    if (!conversaSelecionada) return

    try {
      const textoEnviar = novaMensagem.trim() || (arquivoSelecionado ? `📎 ${arquivoSelecionado.name}` : '')

      const response = await api.post('/mensagens', {
        destinatario_id: conversaSelecionada.contatoId,
        conteudo: textoEnviar,
      })

      const novaMsgId = response.data.id

      if (arquivoSelecionado) {
        const formData = new FormData()
        formData.append('arquivo', arquivoSelecionado)
        formData.append('mensagem_id', novaMsgId)

        const anexoResponse = await api.post('/anexos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        response.data.anexo = anexoResponse.data
      }

      setMensagens((prev) => [...prev, response.data])
      setNovaMensagem('')
      setArquivoSelecionado(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      setConversas((prev) => {
        const conversaExisteNaLista = prev.some(
          (c) => c.conversa_id === conversaSelecionada.conversa_id
        )

        if (!conversaExisteNaLista) {
          return [
            {
              ...conversaSelecionada,
              ultimaMensagem: textoEnviar,
              ultimoEnvio: response.data.enviado_em,
            },
            ...prev,
          ]
        }

        return prev.map((c) =>
          c.conversa_id === conversaSelecionada.conversa_id
            ? {
              ...c,
              ultimaMensagem: textoEnviar,
              ultimoEnvio: response.data.enviado_em,
            }
            : c
        )
      })
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.mensagem)
      } else {
        setErro('Erro ao enviar mensagem.')
      }
    }
  }

  async function excluirMensagem(id) {
    if (!confirm('Deseja remover esta mensagem?')) return
    try {
      await api.delete(`/mensagens/${id}`, { data: { excluida_por: usuario.id } })
      setMensagens((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      setErro('Erro ao remover mensagem.')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) enviarMensagem()
  }

  function iconeAnexo(tipo_mime) {
    if (tipo_mime?.startsWith('image/')) return '🖼️'
    if (tipo_mime === 'application/pdf') return '📄'
    if (tipo_mime?.includes('zip')) return '🗜️'
    return '📎'
  }

  const conversasFiltradas = conversas.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(buscaUsuario.toLowerCase())
  )

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />

      {/* Ajustado a main-content para ocupar altura correta e permitir scroll independente */}
      <div className="main-content flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="topbar">Conversas</div>

        <div className="container-fluid flex-grow-1" style={{ padding: '16px', overflow: 'hidden' }}>
          <div className="row h-100 g-3">

            {/* LISTA DE CONVERSAS (Oculta no mobile caso haja uma conversa ativa selecionada) */}
            <div className={`col-12 col-md-4 col-lg-3 d-flex flex-column h-100 ${conversaSelecionada ? 'd-none d-md-flex' : ''}`} style={{ overflowY: 'auto' }}>
              <div className="d-flex gap-2 mb-3">
                <input
                  className="form-control"
                  placeholder="Buscar conversa"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <button className="btn btn-dark" title="Nova conversa" onClick={abrirNovaConversa}>
                  ✏️
                </button>
              </div>

              {mostrarNovaConversa && (
                <div className="card shadow mb-3 p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Nova conversa</strong>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setMostrarNovaConversa(false)}>✕</button>
                  </div>
                  <input
                    className="form-control mb-2"
                    placeholder="Buscar usuário"
                    value={buscaUsuario}
                    onChange={(e) => setBuscaUsuario(e.target.value)}
                  />
                  <ul className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {usuariosFiltrados.map((u) => (
                      <li key={u.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={() => iniciarConversa(u)}>
                        <div className="d-flex align-items-center">
                          <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" className="avatar me-2" style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt={u.nome} />
                          <div className="text-truncate">
                            <strong className="d-block text-truncate">{u.nome}</strong>
                            <p className="mb-0 text-muted text-truncate" style={{ fontSize: '12px' }}>{u.email}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {conversasFiltradas.length === 0 && !mostrarNovaConversa && (
                <p className="text-muted text-center">Nenhuma conversa encontrada.</p>
              )}

              <ul className="list-group flex-grow-1" style={{ overflowY: 'auto' }}>
                {conversasFiltradas.map((conversa) => (
                  <li
                    key={conversa.conversa_id}
                    className="list-group-item conversation-item d-flex align-items-center p-2"
                    onClick={() => setConversaSelecionada(conversa)}
                    style={{ background: conversaSelecionada?.conversa_id === conversa.conversa_id ? '#f0f0f0' : '', cursor: 'pointer' }}
                  >
                    <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" className="avatar me-2" style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt={conversa.nome} />
                    <div className="conversation-info flex-grow-1 text-truncate">
                      <strong className="d-block text-truncate">{conversa.nome}</strong>
                      <p className="last-message mb-0 text-muted text-truncate" style={{ fontSize: '13px' }}>{conversa.ultimaMensagem}</p>
                    </div>
                    {conversa.nao_lidas > 0 && (
                      <span className="badge bg-danger ms-2">{conversa.nao_lidas}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* ÁREA DO CHAT (Oculta no mobile caso NÃO haja nenhuma conversa selecionada) */}
            <div className={`col-12 col-md-8 col-lg-9 d-flex flex-column h-100 border rounded bg-white ${!conversaSelecionada ? 'd-none d-md-flex' : ''}`} style={{ overflow: 'hidden' }}>
              {!conversaSelecionada ? (
                <div className="d-flex justify-content-center align-items-center h-100 text-muted p-3 text-center">
                  Selecione uma conversa ou clique em ✏️ para iniciar uma nova
                </div>
              ) : (
                <>
                  <div className="d-flex align-items-center mb-2 p-2 border-bottom bg-light">
                    {/* Botão voltar visível apenas no mobile (d-md-none) */}
                    <button className="btn btn-sm btn-outline-secondary me-2 d-md-none" onClick={() => setConversaSelecionada(null)}>
                      ← Voltar
                    </button>
                    <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" className="avatar me-2" style={{ width: '36px', height: '36px', borderRadius: '50%' }} alt={conversaSelecionada.nome} />
                    <strong className="text-truncate" style={{ fontSize: '16px' }}>{conversaSelecionada.nome}</strong>
                  </div>

                  {/* Mensagens com scroll independente */}
                  <div className="chat-messages flex-grow-1 p-2" style={{ overflowY: 'auto', background: '#f8f9fa' }}>
                    {carregando && <p className="text-center text-muted">Carregando mensagens...</p>}
                    {erro && <div className="alert alert-danger py-2">{erro}</div>}

                    {mensagens.map((msg) => (
                      <div
                        key={msg.id}
                        className={`d-flex align-items-start mb-2 ${msg.remetente_id === usuario.id ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        {(isAdmin || msg.remetente_id === usuario.id) && (
                          <button
                            className="btn btn-sm text-danger me-1 mt-1 p-0"
                            style={{ fontSize: '12px', background: 'none', border: 'none', opacity: 0.5 }}
                            title="Remover mensagem"
                            onClick={() => excluirMensagem(msg.id)}
                          >🗑</button>
                        )}

                        <div
                          className={msg.remetente_id === usuario.id ? 'bg-dark text-white p-2 rounded-3' : 'bg-secondary text-white p-2 rounded-3'}
                          style={{ maxWidth: '75%', wordBreak: 'break-word' }}
                        >
                          <span>{msg.conteudo}</span>

                          {msg.anexo && (
                            <div className="mt-1">
                              <a
                                href={getDownloadUrl(msg.anexo.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '11px' }}
                              >
                                {iconeAnexo(msg.anexo.tipo_mime)} {msg.anexo.nome_arquivo}
                              </a>
                            </div>
                          )}

                          <div className="text-end" style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
                            {new Date(msg.enviado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {msg.remetente_id === usuario.id && (
                              <span className="ms-1">{msg.lido_em ? '✓✓' : '✓'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={mensagensEndRef} />
                  </div>

                  {/* Preview do arquivo selecionado */}
                  {arquivoSelecionado && (
                    <div className="d-flex align-items-center gap-2 px-2 pt-2 bg-light">
                      <span className="badge bg-secondary text-truncate" style={{ maxWidth: '200px' }}>
                        📎 {arquivoSelecionado.name}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger py-0"
                        onClick={() => { setArquivoSelecionado(null); fileInputRef.current.value = '' }}
                      >✕</button>
                    </div>
                  )}

                  <div className="chat-input d-flex gap-2 p-2 border-top bg-light">
                    <label className="btn btn-outline-secondary mb-0 d-flex align-items-center" title="Anexar arquivo">
                      📎
                      <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        accept=".pdf,.docx,.zip,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={selecionarArquivo}
                      />
                    </label>

                    <input
                      className="form-control"
                      placeholder="Digite sua mensagem"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />

                    <button className="btn btn-dark" onClick={enviarMensagem}>
                      Enviar
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}