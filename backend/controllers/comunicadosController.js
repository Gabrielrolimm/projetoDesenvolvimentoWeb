const comunicadoModel = require('../models/comunicadoModel')
const { verificarAdmin } = require('../models/adminModel')

async function listar(req, res) {
  try {
    const rows = await comunicadoModel.listar()
    return res.status(200).json(rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function publicar(req, res) {
  const { titulo, conteudo } = req.body
  const solicitante_id = req.headers['x-usuario-id']

  const isAdmin = await verificarAdmin(solicitante_id)
  if (!isAdmin) {
    return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem publicar comunicados.' })
  }

  if (!titulo || !conteudo) {
    return res.status(400).json({ mensagem: 'Título e conteúdo são obrigatórios.' })
  }

  try {
    await comunicadoModel.publicar({ titulo, conteudo, autor_id: solicitante_id })

    const novo = await comunicadoModel.buscarMaisRecente()

    return res.status(201).json({ mensagem: 'Comunicado publicado com sucesso.', comunicado: novo })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function remover(req, res) {
  const { id } = req.params
  const solicitante_id = req.headers['x-usuario-id']

  const isAdmin = await verificarAdmin(solicitante_id)
  if (!isAdmin) {
    return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem remover comunicados.' })
  }

  try {
    const existe = await comunicadoModel.buscarPorId(id)
    if (!existe) {
      return res.status(404).json({ mensagem: 'Comunicado não encontrado.' })
    }

    await comunicadoModel.remover(id)

    return res.status(200).json({ mensagem: 'Comunicado removido.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

module.exports = { listar, publicar, remover }
