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

async function buscar(req, res) {
  const { id } = req.params

  try {
    const usuarioLogado = req.usuario

    if (usuarioLogado.perfil !== 'admin' && usuarioLogado._id.toString() !== id) {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para acessar este perfil.',
      })
    }

    const usuario = await Usuario.findById(id).select('-senha_hash')

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.',
      })
    }

    return res.status(200).json(formatarUsuario(usuario))
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

async function atualizar(req, res) {
  const { id } = req.params
  const { nome, email, senhaAtual, novaSenha } = req.body

  if (!nome || !email) {
    return res.status(400).json({
      mensagem: 'Nome e e-mail são obrigatórios.',
    })
  }

  try {
    const usuarioLogado = req.usuario

    if (usuarioLogado.perfil !== 'admin' && usuarioLogado._id.toString() !== id) {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para atualizar este perfil.',
      })
    }

    const usuario = await Usuario.findById(id)

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.',
      })
    }

    const emailEmUso = await Usuario.findOne({
      email,
      _id: { $ne: id },
    })

    if (emailEmUso) {
      return res.status(409).json({
        mensagem: 'Este e-mail já está em uso.',
      })
    }

    usuario.nome = nome
    usuario.email = email

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({
          mensagem: 'Informe a senha atual para alterá-la.',
        })
      }

      const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha_hash)

      if (!senhaCorreta) {
        return res.status(401).json({
          mensagem: 'Senha atual incorreta.',
        })
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          mensagem: 'A nova senha deve ter pelo menos 6 caracteres.',
        })
      }

      usuario.senha_hash = await bcrypt.hash(novaSenha, 10)
    }

    await usuario.save()

    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: formatarUsuario(usuario),
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

module.exports = {
  buscar,
  atualizar,
}