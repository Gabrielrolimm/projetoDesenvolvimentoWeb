const db = require('../db')

async function listarConversas(usuarioId) {
  const [conversas] = await db.query(
    `SELECT
      c.id AS conversa_id,
      u.id AS contatoId,
      u.nome,
      m.conteudo AS ultimaMensagem,
      m.enviado_em AS ultimoEnvio,
      COUNT(msg_nr.id) AS nao_lidas
     FROM conversa_participantes cp
     JOIN conversas c ON c.id = cp.conversa_id
     JOIN conversa_participantes cp2 ON cp2.conversa_id = c.id AND cp2.usuario_id != ?
     JOIN usuarios u ON u.id = cp2.usuario_id
     LEFT JOIN mensagens m ON m.id = (
       SELECT id FROM mensagens
       WHERE conversa_id = c.id AND excluida = FALSE
       ORDER BY enviado_em DESC
       LIMIT 1
     )
     LEFT JOIN mensagens msg_nr ON
       msg_nr.conversa_id = c.id AND
       msg_nr.excluida = FALSE AND
       msg_nr.remetente_id != ? AND
       msg_nr.id NOT IN (
         SELECT mensagem_id FROM status_leitura WHERE usuario_id = ?
       )
     WHERE cp.usuario_id = ?
     GROUP BY c.id, u.id, u.nome, m.conteudo, m.enviado_em
     ORDER BY m.enviado_em DESC`,
    [usuarioId, usuarioId, usuarioId, usuarioId]
  )
  return conversas
}

async function listarHistorico(conversaId, usuarioId) {
  const [mensagens] = await db.query(
    `SELECT m.id, m.conversa_id, m.remetente_id, m.conteudo, m.enviado_em,
            u.nome AS remetente_nome,
            sl.lido_em,
            a.id AS anexo_id,
            a.nome_arquivo,
            a.tipo_mime,
            a.tamanho_bytes
     FROM mensagens m
     JOIN usuarios u ON u.id = m.remetente_id
     LEFT JOIN status_leitura sl ON sl.mensagem_id = m.id AND sl.usuario_id = ?
     LEFT JOIN anexos a ON a.mensagem_id = m.id
     WHERE m.conversa_id = ? AND m.excluida = FALSE
     ORDER BY m.enviado_em ASC`,
    [usuarioId, conversaId]
  )
  return mensagens
}

async function marcarComoLidas(valores) {
  await db.query(
    'INSERT IGNORE INTO status_leitura (mensagem_id, usuario_id) VALUES ?',
    [valores]
  )
}

async function buscarConversaEntreUsuarios(remetente_id, destinatario_id) {
  const [rows] = await db.query(
    `SELECT c.id FROM conversas c
     JOIN conversa_participantes cp1 ON cp1.conversa_id = c.id AND cp1.usuario_id = ?
     JOIN conversa_participantes cp2 ON cp2.conversa_id = c.id AND cp2.usuario_id = ?`,
    [remetente_id, destinatario_id]
  )
  return rows[0]
}

async function criarConversa(remetente_id) {
  await db.query('INSERT INTO conversas (criado_por) VALUES (?)', [remetente_id])
  const [conversa] = await db.query(
    'SELECT id FROM conversas WHERE criado_por = ? ORDER BY criado_em DESC LIMIT 1',
    [remetente_id]
  )
  return conversa[0].id
}

async function adicionarParticipantes(conversaId, remetente_id, destinatario_id) {
  await db.query(
    'INSERT INTO conversa_participantes (conversa_id, usuario_id) VALUES (?, ?), (?, ?)',
    [conversaId, remetente_id, conversaId, destinatario_id]
  )
}

async function enviar(conversaId, remetente_id, conteudo) {
  await db.query(
    'INSERT INTO mensagens (conversa_id, remetente_id, conteudo) VALUES (?, ?, ?)',
    [conversaId, remetente_id, conteudo]
  )
}

async function buscarMaisRecentePorConversa(conversaId) {
  const [rows] = await db.query(
    'SELECT * FROM mensagens WHERE conversa_id = ? ORDER BY enviado_em DESC LIMIT 1',
    [conversaId]
  )
  return rows[0]
}

async function buscarPorId(id) {
  const [rows] = await db.query('SELECT id FROM mensagens WHERE id = ?', [id])
  return rows[0]
}

async function excluir(id, excluida_por) {
  await db.query(
    'UPDATE mensagens SET excluida = TRUE, excluida_por = ? WHERE id = ?',
    [excluida_por, id]
  )
}

module.exports = {
  listarConversas,
  listarHistorico,
  marcarComoLidas,
  buscarConversaEntreUsuarios,
  criarConversa,
  adicionarParticipantes,
  enviar,
  buscarMaisRecentePorConversa,
  buscarPorId,
  excluir,
}
