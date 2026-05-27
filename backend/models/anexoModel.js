const db = require('../db')

async function buscarMensagemPorId(mensagem_id) {
  const [rows] = await db.query('SELECT id FROM mensagens WHERE id = ?', [mensagem_id])
  return rows[0]
}

async function cadastrar({ mensagem_id, nome_arquivo, tipo_mime, tamanho_bytes, caminho }) {
  await db.query(
    `INSERT INTO anexos (mensagem_id, nome_arquivo, tipo_mime, tamanho_bytes, caminho)
     VALUES (?, ?, ?, ?, ?)`,
    [mensagem_id, nome_arquivo, tipo_mime, tamanho_bytes, caminho]
  )
}

async function buscarMaisRecentePorMensagem(mensagem_id) {
  const [rows] = await db.query(
    'SELECT * FROM anexos WHERE mensagem_id = ? ORDER BY criado_em DESC LIMIT 1',
    [mensagem_id]
  )
  return rows[0]
}

async function buscarPorId(id) {
  const [rows] = await db.query('SELECT * FROM anexos WHERE id = ?', [id])
  return rows[0]
}

async function listarPorMensagem(mensagemId) {
  const [rows] = await db.query(
    'SELECT * FROM anexos WHERE mensagem_id = ?',
    [mensagemId]
  )
  return rows
}

module.exports = {
  buscarMensagemPorId,
  cadastrar,
  buscarMaisRecentePorMensagem,
  buscarPorId,
  listarPorMensagem,
}
