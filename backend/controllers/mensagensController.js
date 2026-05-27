const mongoose = require('mongoose')

const Usuario = require('../models/usuarioModel')
const Conversa = require('../models/conversaModel')
const Mensagem = require('../models/mensagemModel')
const Anexo = require('../models/anexoModel')

function mesmoId(a, b) {
  if (!a || !b) return false
  return a.toString() === b.toString()
}

function obterLeituraDaMensagem(mensagem, usuarioAtualId) {
  if (!Array.isArray(mensagem.lido_por)) {
    return null
  }

  const mensagemFoiEnviadaPeloUsuarioAtual = mesmoId(
    mensagem.remetente?._id || mensagem.remetente,
    usuarioAtualId
  )

  if (mensagemFoiEnviadaPeloUsuarioAtual) {
    const leituraDoDestinatario = mensagem.lido_por.find((item) => {
      return !mesmoId(item.usuario, usuarioAtualId)
    })

    return leituraDoDestinatario?.lido_em || null
  }

  const minhaLeitura = mensagem.lido_por.find((item) => {
    return mesmoId(item.usuario, usuarioAtualId)
  })

  return minhaLeitura?.lido_em || null
}

function formatarMensagem(mensagem, anexo = null, usuarioAtualId = null) {
  return {
    id: mensagem._id.toString(),
    conversa_id: mensagem.conversa?.toString(),
    remetente_id:
      mensagem.remetente?._id?.toString() || mensagem.remetente?.toString(),
    remetente_nome: mensagem.remetente?.nome || 'Usuário',
    conteudo: mensagem.conteudo,
    enviado_em: mensagem.createdAt,
    lido_em: usuarioAtualId
      ? obterLeituraDaMensagem(mensagem, usuarioAtualId)
      : null,
    anexo: anexo
      ? {
        id: anexo._id.toString(),
        nome_arquivo: anexo.nome_arquivo,
        tipo_mime: anexo.tipo_mime,
        tamanho_bytes: anexo.tamanho_bytes,
      }
      : null,
  }
}

async function listarConversas(req, res) {
  try {
    const usuarioId = req.usuario._id

    const conversas = await Conversa.find({
      participantes: usuarioId,
    })
      .populate('participantes', 'nome email')
      .sort({ updatedAt: -1 })

    const resultado = await Promise.all(
      conversas.map(async (conversa) => {
        const contato = conversa.participantes.find(
          (participante) => !mesmoId(participante._id, usuarioId)
        )

        const ultimaMensagem = await Mensagem.findOne({
          conversa: conversa._id,
          excluida: false,
        }).sort({ createdAt: -1 })

        const naoLidas = await Mensagem.countDocuments({
          conversa: conversa._id,
          excluida: false,
          remetente: { $ne: usuarioId },
          'lido_por.usuario': { $ne: usuarioId },
        })

        return {
          conversa_id: conversa._id.toString(),
          contatoId: contato?._id?.toString() || null,
          nome: contato?.nome || 'Usuário removido',
          email: contato?.email || '',
          ultimaMensagem: ultimaMensagem?.conteudo || '',
          ultimoEnvio: ultimaMensagem?.createdAt || conversa.createdAt,
          nao_lidas: naoLidas,
        }
      })
    )

    resultado.sort((a, b) => {
      return new Date(b.ultimoEnvio) - new Date(a.ultimoEnvio)
    })

    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Erro ao listar conversas:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor ao listar conversas.',
    })
  }
}

async function listarHistorico(req, res) {
  const { conversaId } = req.params

  try {
    const usuarioId = req.usuario._id

    if (!mongoose.Types.ObjectId.isValid(conversaId)) {
      return res.status(400).json({
        mensagem: 'ID da conversa inválido.',
      })
    }

    const conversa = await Conversa.findById(conversaId)

    if (!conversa) {
      return res.status(404).json({
        mensagem: 'Conversa não encontrada.',
      })
    }

    const participaDaConversa = conversa.participantes.some((participanteId) =>
      mesmoId(participanteId, usuarioId)
    )

    if (!participaDaConversa) {
      return res.status(403).json({
        mensagem: 'Você não participa desta conversa.',
      })
    }

    let mensagens = await Mensagem.find({
      conversa: conversaId,
      excluida: false,
    })
      .populate('remetente', 'nome email')
      .sort({ createdAt: 1 })

    const mensagensParaMarcarComoLidas = mensagens.filter((mensagem) => {
      const enviadaPorOutroUsuario = !mesmoId(
        mensagem.remetente._id,
        usuarioId
      )

      const jaFoiLidaPorMim = mensagem.lido_por.some((item) =>
        mesmoId(item.usuario, usuarioId)
      )

      return enviadaPorOutroUsuario && !jaFoiLidaPorMim
    })

    await Promise.all(
      mensagensParaMarcarComoLidas.map((mensagem) => {
        mensagem.lido_por.push({
          usuario: usuarioId,
          lido_em: new Date(),
        })

        return mensagem.save()
      })
    )

    mensagens = await Mensagem.find({
      conversa: conversaId,
      excluida: false,
    })
      .populate('remetente', 'nome email')
      .sort({ createdAt: 1 })

    const mensagensFormatadas = await Promise.all(
      mensagens.map(async (mensagem) => {
        const anexo = await Anexo.findOne({
          mensagem: mensagem._id,
        })

        return formatarMensagem(mensagem, anexo, usuarioId)
      })
    )

    return res.status(200).json(mensagensFormatadas)
  } catch (error) {
    console.error('Erro ao listar histórico:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor ao listar histórico.',
    })
  }
}

async function enviar(req, res) {
  const { destinatario_id, conteudo } = req.body

  if (!destinatario_id || !conteudo) {
    return res.status(400).json({
      mensagem: 'Destinatário e conteúdo são obrigatórios.',
    })
  }

  try {
    const remetenteId = req.usuario._id

    if (!mongoose.Types.ObjectId.isValid(destinatario_id)) {
      return res.status(400).json({
        mensagem: 'ID do destinatário inválido.',
      })
    }

    if (mesmoId(remetenteId, destinatario_id)) {
      return res.status(400).json({
        mensagem: 'Você não pode enviar mensagem para si mesmo.',
      })
    }

    const destinatario = await Usuario.findById(destinatario_id)

    if (!destinatario || !destinatario.ativo) {
      return res.status(404).json({
        mensagem: 'Destinatário não encontrado ou inativo.',
      })
    }

    let conversa = await Conversa.findOne({
      participantes: {
        $all: [remetenteId, destinatario_id],
      },
    })

    if (!conversa) {
      conversa = await Conversa.create({
        participantes: [remetenteId, destinatario_id],
        criado_por: remetenteId,
      })
    }

    const mensagem = await Mensagem.create({
      conversa: conversa._id,
      remetente: remetenteId,
      conteudo,
      lido_por: [],
    })

    conversa.updatedAt = new Date()
    await conversa.save()

    const mensagemCompleta = await Mensagem.findById(mensagem._id).populate(
      'remetente',
      'nome email'
    )

    return res
      .status(201)
      .json(formatarMensagem(mensagemCompleta, null, remetenteId))
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor ao enviar mensagem.',
    })
  }
}

async function excluir(req, res) {
  const { id } = req.params

  try {
    const usuarioId = req.usuario._id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensagem: 'ID da mensagem inválido.',
      })
    }

    const mensagem = await Mensagem.findById(id)

    if (!mensagem) {
      return res.status(404).json({
        mensagem: 'Mensagem não encontrada.',
      })
    }

    const usuarioPodeExcluir =
      req.usuario.perfil === 'admin' || mesmoId(mensagem.remetente, usuarioId)

    if (!usuarioPodeExcluir) {
      return res.status(403).json({
        mensagem: 'Você não tem permissão para remover esta mensagem.',
      })
    }

    mensagem.excluida = true
    mensagem.excluida_por = usuarioId

    await mensagem.save()

    return res.status(200).json({
      mensagem: 'Mensagem removida.',
    })
  } catch (error) {
    console.error('Erro ao excluir mensagem:', error)

    return res.status(500).json({
      mensagem: 'Erro interno do servidor ao excluir mensagem.',
    })
  }
}

module.exports = {
  listarConversas,
  listarHistorico,
  enviar,
  excluir,
}