const usuarios = [
  {
    id: 1,
    nome: 'João Gabriel',
    email: 'joao@email.com',
    senha: '$2b$10$1bqtoxnuZIAhL4raCsBeE.MnMpscXn82VTa30sYmpJVUXUJf2jn7q',
    perfil: 'admin',
    status: 'ativo',
  },
  {
    id: 2,
    nome: 'Pedro Natan',
    email: 'pedro@email.com',
    senha: '$2b$10$byhrfhi9UGbJ8Z1XcuccfuBUepGNxzAX7EIopJUCe72qX1oOcFLoO',
    perfil: 'usuario',
    status: 'ativo',
  },
  {
    id: 3,
    nome: 'Felipe Menezes',
    email: 'felipe@email.com',
    senha: '$2b$10$6qAhvvlPvxRkODUCXHCvd.UhVmvXxwkVQUIq.Dwy74KCi5hMXg0We',
    perfil: 'usuario',
    status: 'ativo',
  },
]

const mensagens = [
  {
    id: 1,
    remetente_id: 2,
    destinatario_id: 1,
    conteudo: 'Enviou o documento?',
    enviado_em: '2026-04-10T10:00:00',
  },
  {
    id: 2,
    remetente_id: 1,
    destinatario_id: 2,
    conteudo: 'Sim, está anexado.',
    enviado_em: '2026-04-10T10:01:00',
  },
  {
    id: 3,
    remetente_id: 3,
    destinatario_id: 1,
    conteudo: 'Vamos revisar amanhã.',
    enviado_em: '2026-04-10T11:00:00',
  },
]

module.exports = { usuarios, mensagens }