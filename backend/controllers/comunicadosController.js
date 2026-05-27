const Comunicado = require('../models/comunicadoModel')

function formatarComunicado(comunicado) {
  return {
    id: comunicado._id.toString(),
    titulo: comunicado.titulo,
    conteudo: comunicado.conteudo,
    publicado_em: comunicado.createdAt,
    atualizado_em: comunicado.updatedAt,
    autor_id: comunicado.autor?._id?.toString() || comunicado.autor?.toString(),
    autor_nome: comunicado.autor?.nome || 'Usuário não encontrado',
  }
}

async function listar(req, res) {
  try {
    const comunicados = await Comunicado.find()
      .populate('autor', 'nome email')
      .sort({ createdAt: -1 })

    return res.status(200).json(comunicados.map(formatarComunicado))
  } catch (error) {
    console.error('Erro ao listar comunicados:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor ao listar comunicados.',
    })
  }
}

async function publicar(req, res) {
  const { titulo, conteudo } = req.body

  if (!titulo || !conteudo) {
    return res.status(400).json({
      mensagem: 'Título e conteúdo são obrigatórios.',
    })
  }

  try {
    const comunicado = await Comunicado.create({
      titulo,
      conteudo,
      autor: req.usuario._id,
    })

    const comunicadoCompleto = await Comunicado.findById(comunicado._id)
      .populate('autor', 'nome email')

    return res.status(201).json({
      mensagem: 'Comunicado publicado com sucesso.',
      comunicado: formatarComunicado(comunicadoCompleto),
    })
  } catch (error) {
    console.error('Erro ao publicar comunicado:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor ao publicar comunicado.',
      erro: error.message,
    })
  }
}

async function remover(req, res) {
  const { id } = req.params

  try {
    const comunicado = await Comunicado.findById(id)

    if (!comunicado) {
      return res.status(404).json({
        mensagem: 'Comunicado não encontrado.',
      })
    }

    await Comunicado.findByIdAndDelete(id)

    return res.status(200).json({
      mensagem: 'Comunicado removido.',
    })
  } catch (error) {
    console.error('Erro ao remover comunicado:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor ao remover comunicado.',
      erro: error.message,
    })
  }
}

module.exports = {
  listar,
  publicar,
  remover,
}