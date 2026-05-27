const bcrypt = require('bcrypt')
const authModel = require('../models/authModel')

async function login(req, res) {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' })
  }

  try {
    const usuario = await authModel.buscarUsuarioAtivoPorEmail(email)
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Email ou senha incorretos.' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Email ou senha incorretos.' })
    }

    const { senha_hash, ...usuarioSemSenha } = usuario

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      usuario: usuarioSemSenha,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

module.exports = { login }
