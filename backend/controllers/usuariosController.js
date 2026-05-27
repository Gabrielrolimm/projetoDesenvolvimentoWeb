const bcrypt = require('bcrypt')
const Usuario = require('../models/usuarioModel')

function formatarUsuario(usuario) {
  return {
    id: usuario._id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    ativo: usuario.ativo,
    criado_em: usuario.createdAt,
    atualizado_em: usuario.updatedAt,
  }
}

async function listar(req, res) {
  try {
    const usuarios = await Usuario.find()
      .select('-senha_hash')
      .sort({ createdAt: -1 })

    return res.status(200).json(usuarios.map(formatarUsuario))
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

async function cadastrar(req, res) {
  const { nome, email, senha, perfil, perfil_id } = req.body

  if (!nome || !email || !senha) {
    return res.status(400).json({
      mensagem: 'Nome, email e senha são obrigatórios.',
    })
  }

  if (senha.length < 6) {
    return res.status(400).json({
      mensagem: 'A senha deve ter pelo menos 6 caracteres.',
    })
  }

  try {
    const existe = await Usuario.findOne({ email })

    if (existe) {
      return res.status(409).json({
        mensagem: 'Este e-mail já está cadastrado.',
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    let perfilFinal = perfil || 'usuario'

    if (perfil_id === 1) {
      perfilFinal = 'admin'
    }

    if (perfil_id === 2) {
      perfilFinal = 'usuario'
    }

    const usuario = await Usuario.create({
      nome,
      email,
      senha_hash: senhaHash,
      perfil: perfilFinal,
    })

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: formatarUsuario(usuario),
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

async function editar(req, res) {
  const { id } = req.params
  const { nome, email, perfil, perfil_id, ativo } = req.body

  try {
    const usuario = await Usuario.findById(id)

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.',
      })
    }

    if (email && email !== usuario.email) {
      const emailEmUso = await Usuario.findOne({ email })

      if (emailEmUso) {
        return res.status(409).json({
          mensagem: 'Este e-mail já está em uso.',
        })
      }
    }

    let perfilFinal = perfil || usuario.perfil

    if (perfil_id === 1) {
      perfilFinal = 'admin'
    }

    if (perfil_id === 2) {
      perfilFinal = 'usuario'
    }

    usuario.nome = nome || usuario.nome
    usuario.email = email || usuario.email
    usuario.perfil = perfilFinal

    if (typeof ativo === 'boolean') {
      usuario.ativo = ativo
    }

    await usuario.save()

    return res.status(200).json({
      mensagem: 'Usuário atualizado.',
      usuario: formatarUsuario(usuario),
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

async function excluir(req, res) {
  const { id } = req.params

  try {
    const usuario = await Usuario.findById(id)

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.',
      })
    }

    usuario.ativo = false

    await usuario.save()

    return res.status(200).json({
      mensagem: 'Usuário desativado.',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

module.exports = {
  listar,
  cadastrar,
  editar,
  excluir,
}