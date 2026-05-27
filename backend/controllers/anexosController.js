const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')

const Anexo = require('../models/anexoModel')
const Mensagem = require('../models/mensagemModel')

function mesmoId(a, b) {
  return a?.toString() === b?.toString()
}

function formatarAnexo(anexo) {
  return {
    id: anexo._id,
    mensagem_id: anexo.mensagem,
    nome_arquivo: anexo.nome_arquivo,
    tipo_mime: anexo.tipo_mime,
    tamanho_bytes: anexo.tamanho_bytes,
    criado_em: anexo.createdAt,
  }
}

async function enviar(req, res) {
  if (!req.file) {
    return res.status(400).json({
      mensagem: 'Nenhum arquivo enviado.',
    })
  }

  const { mensagem_id } = req.body

  if (!mensagem_id) {
    return res.status(400).json({
      mensagem: 'mensagem_id é obrigatório.',
    })
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(mensagem_id)) {
      return res.status(400).json({
        mensagem: 'ID da mensagem inválido.',
      })
    }

    const mensagem = await Mensagem.findById(mensagem_id)

    if (!mensagem) {
      return res.status(404).json({
        mensagem: 'Mensagem não encontrada.',
      })
    }

    const usuarioPodeAnexar =
      req.usuario.perfil === 'admin' || mesmoId(mensagem.remetente, req.usuario._id)

    if (!usuarioPodeAnexar) {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para anexar arquivo nesta mensagem.',
      })
    }

    const anexo = await Anexo.create({
      mensagem: mensagem_id,
      nome_arquivo: req.file.originalname,
      tipo_mime: req.file.mimetype,
      tamanho_bytes: req.file.size,
      caminho: req.file.filename,
    })

    return res.status(201).json(formatarAnexo(anexo))
  } catch (error) {
    console.error('Erro ao enviar anexo:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

async function download(req, res) {
  const { id } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensagem: 'ID do anexo inválido.',
      })
    }

    const anexo = await Anexo.findById(id)

    if (!anexo) {
      return res.status(404).json({
        mensagem: 'Anexo não encontrado.',
      })
    }

    const caminho = path.join(__dirname, '..', 'uploads', anexo.caminho)

    if (!fs.existsSync(caminho)) {
      return res.status(404).json({
        mensagem: 'Arquivo não encontrado no servidor.',
      })
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(anexo.nome_arquivo)}"`
    )

    res.setHeader('Content-Type', anexo.tipo_mime)

    return res.sendFile(caminho)
  } catch (error) {
    console.error('Erro ao baixar anexo:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

async function listarPorMensagem(req, res) {
  const { mensagemId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(mensagemId)) {
      return res.status(400).json({
        mensagem: 'ID da mensagem inválido.',
      })
    }

    const anexos = await Anexo.find({
      mensagem: mensagemId,
    }).sort({ createdAt: -1 })

    return res.status(200).json(anexos.map(formatarAnexo))
  } catch (error) {
    console.error('Erro ao listar anexos:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor.',
    })
  }
}

module.exports = {
  enviar,
  download,
  listarPorMensagem,
}