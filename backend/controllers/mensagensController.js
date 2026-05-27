const mensagemModel = require('../models/mensagemModel')

async function listarConversas(req, res) {
  const { usuarioId } = req.params

  try {
    const conversas = await mensagemModel.listarConversas(usuarioId)

    return res.status(200).json(conversas)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function listarHistorico(req, res) {
  const { conversaId } = req.params
  const usuarioId = req.headers['x-usuario-id']

  try {
    const mensagens = await mensagemModel.listarHistorico(conversaId, usuarioId)

    // Formata o anexo como objeto dentro da mensagem
    const mensagensFormatadas = mensagens.map((m) => ({
      id: m.id,
      conversa_id: m.conversa_id,
      remetente_id: m.remetente_id,
      remetente_nome: m.remetente_nome,
      conteudo: m.conteudo,
      enviado_em: m.enviado_em,
      lido_em: m.lido_em,
      anexo: m.anexo_id ? {
        id: m.anexo_id,
        nome_arquivo: m.nome_arquivo,
        tipo_mime: m.tipo_mime,
        tamanho_bytes: m.tamanho_bytes,
      } : null,
    }))

    // Marca como lidas as mensagens recebidas que ainda não foram lidas
    const naoLidas = mensagensFormatadas.filter(
      (m) => m.remetente_id !== usuarioId && !m.lido_em
    )

    if (naoLidas.length > 0) {
      const valores = naoLidas.map((m) => [m.id, usuarioId])
      await mensagemModel.marcarComoLidas(valores)
    }

    return res.status(200).json(mensagensFormatadas)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}
async function enviar(req, res) {
  const { remetente_id, destinatario_id, conteudo } = req.body

  if (!remetente_id || !destinatario_id || !conteudo) {
    return res.status(400).json({ mensagem: 'Remetente, destinatário e conteúdo são obrigatórios.' })
  }

  try {
    const existente = await mensagemModel.buscarConversaEntreUsuarios(remetente_id, destinatario_id)

    let conversaId

    if (existente) {
      conversaId = existente.id
    } else {
      conversaId = await mensagemModel.criarConversa(remetente_id)
      await mensagemModel.adicionarParticipantes(conversaId, remetente_id, destinatario_id)
    }

    await mensagemModel.enviar(conversaId, remetente_id, conteudo)

    const nova = await mensagemModel.buscarMaisRecentePorConversa(conversaId)

    return res.status(201).json(nova)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

async function excluir(req, res) {
  const { id } = req.params
  const { excluida_por } = req.body

  try {
    const existe = await mensagemModel.buscarPorId(id)
    if (!existe) {
      return res.status(404).json({ mensagem: 'Mensagem não encontrada.' })
    }

    await mensagemModel.excluir(id, excluida_por)

    return res.status(200).json({ mensagem: 'Mensagem removida.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' })
  }
}

module.exports = { listarConversas, listarHistorico, enviar, excluir }
