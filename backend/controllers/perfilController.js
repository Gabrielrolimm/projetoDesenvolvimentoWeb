const bcrypt = require('bcrypt')
const perfilModel = require('../models/perfilModel')

async function buscar(req, res) {
  const { id } = req.params

  try {
    const usuario = await perfilModel.buscarPorId(id)

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' })
    }

    return res.status(200).json(usuario)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function atualizar(req, res) {
  const { id } = req.params
  const { nome, email, senhaAtual, novaSenha } = req.body

  if (!nome || !email) {
    return res.status(400).json({ mensagem: 'Nome e e-mail são obrigatórios.' })
  }

  try {
    const usuario = await perfilModel.buscarCompletoPorId(id)
    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' })
    }

    const emailEmUso = await perfilModel.buscarEmailEmUso(email, id)
    if (emailEmUso) {
      return res.status(409).json({ mensagem: 'Este e-mail já está em uso.' })
    }

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ mensagem: 'Informe a senha atual para alterá-la.' })
      }

      const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash)
      if (!senhaCorreta) {
        return res.status(401).json({ mensagem: 'Senha atual incorreta.' })
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ mensagem: 'A nova senha deve ter pelo menos 6 caracteres.' })
      }

      const novoHash = await bcrypt.hash(novaSenha, 10)
      await perfilModel.atualizarSenha(id, novoHash)
    }

    await perfilModel.atualizarDados(id, nome, email)

    const atualizado = await perfilModel.buscarPorId(id)

    return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso.', usuario: atualizado })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

module.exports = { buscar, atualizar }
