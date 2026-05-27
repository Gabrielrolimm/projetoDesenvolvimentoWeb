const bcrypt = require('bcrypt')
const usuarioModel = require('../models/usuarioModel')
const { verificarAdmin } = require('../models/adminModel')

async function listar(req, res) {
  try {
    const rows = await usuarioModel.listar()
    return res.status(200).json(rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function cadastrar(req, res) {
  const { nome, email, senha, perfil_id } = req.body

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' })
  }

  try {
    const existe = await usuarioModel.buscarPorEmail(email)
    if (existe) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    await usuarioModel.cadastrar({ nome, email, senhaHash, perfil_id })

    const novo = await usuarioModel.buscarDadosPublicosPorEmail(email)

    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', usuario: novo })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function editar(req, res) {
  const { id } = req.params
  const { nome, email, perfil_id, ativo } = req.body
  const solicitante_id = req.headers['x-usuario-id']

  const isAdmin = await verificarAdmin(solicitante_id)
  if (!isAdmin) {
    return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem realizar esta ação.' })
  }

  try {
    const existe = await usuarioModel.buscarPorId(id)
    if (!existe) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' })
    }

    await usuarioModel.editar({ id, nome, email, perfil_id, ativo })

    const atualizado = await usuarioModel.buscarDadosPublicosPorId(id)

    return res.status(200).json({ mensagem: 'Usuário atualizado.', usuario: atualizado })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function excluir(req, res) {
  const { id } = req.params
  const solicitante_id = req.headers['x-usuario-id']

  const isAdmin = await verificarAdmin(solicitante_id)
  if (!isAdmin) {
    return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem realizar esta ação.' })
  }

  try {
    const existe = await usuarioModel.buscarPorId(id)
    if (!existe) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' })
    }

    await usuarioModel.desativar(id)

    return res.status(200).json({ mensagem: 'Usuário desativado.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

module.exports = { listar, cadastrar, editar, excluir }
