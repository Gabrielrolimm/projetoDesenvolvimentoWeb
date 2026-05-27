const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuarioModel')

async function login(req, res) {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({
      mensagem: 'Email e senha são obrigatórios.',
    })
  }

  try {
    const usuario = await Usuario.findOne({
      email,
      ativo: true,
    })

    if (!usuario) {
      return res.status(401).json({
        mensagem: 'Email ou senha incorretos.',
      })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash)

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: 'Email ou senha incorretos.',
      })
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    )

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

module.exports = {
  login,
}