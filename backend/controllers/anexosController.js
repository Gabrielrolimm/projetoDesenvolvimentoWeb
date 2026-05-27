const path = require('path')
const fs = require('fs')
const anexoModel = require('../models/anexoModel')

async function enviar(req, res) {
  if (!req.file) {
    return res.status(400).json({ mensagem: 'Nenhum arquivo enviado.' })
  }

  const { mensagem_id } = req.body

  if (!mensagem_id) {
    return res.status(400).json({ mensagem: 'mensagem_id é obrigatório.' })
  }

  try {
    const mensagem = await anexoModel.buscarMensagemPorId(mensagem_id)
    if (!mensagem) {
      return res.status(404).json({ mensagem: 'Mensagem não encontrada.' })
    }

    await anexoModel.cadastrar({
      mensagem_id,
      nome_arquivo: req.file.originalname,
      tipo_mime: req.file.mimetype,
      tamanho_bytes: req.file.size,
      caminho: req.file.filename,
    })

    const novo = await anexoModel.buscarMaisRecentePorMensagem(mensagem_id)

    return res.status(201).json(novo)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function download(req, res) {
  const { id } = req.params

  try {
    const anexo = await anexoModel.buscarPorId(id)
    if (!anexo) {
      return res.status(404).json({ mensagem: 'Anexo não encontrado.' })
    }

    const caminho = path.join(__dirname, '..', 'uploads', anexo.caminho)

    if (!fs.existsSync(caminho)) {
      return res.status(404).json({ mensagem: 'Arquivo não encontrado no servidor.' })
    }

    res.setHeader('Content-Disposition', `attachment; filename="${anexo.nome_arquivo}"`)
    res.setHeader('Content-Type', anexo.tipo_mime)
    return res.sendFile(caminho)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function listarPorMensagem(req, res) {
  const { mensagemId } = req.params

  try {
    const rows = await anexoModel.listarPorMensagem(mensagemId)
    return res.status(200).json(rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

module.exports = { enviar, download, listarPorMensagem }
