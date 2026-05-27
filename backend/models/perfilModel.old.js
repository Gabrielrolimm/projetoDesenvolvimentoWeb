const db = require('../db')

async function buscarPorId(id) {
  const [rows] = await db.query(
    `SELECT u.id, u.nome, u.email, u.ativo, u.criado_em, p.nome AS perfil
     FROM usuarios u
     JOIN perfis p ON u.perfil_id = p.id
     WHERE u.id = ?`,
    [id]
  )
  return rows[0]
}

async function buscarCompletoPorId(id) {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id])
  return rows[0]
}

async function buscarEmailEmUso(email, id) {
  const [rows] = await db.query(
    'SELECT id FROM usuarios WHERE email = ? AND id != ?',
    [email, id]
  )
  return rows[0]
}

async function atualizarSenha(id, novoHash) {
  await db.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [novoHash, id])
}

async function atualizarDados(id, nome, email) {
  await db.query('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?', [nome, email, id])
}

module.exports = {
  buscarPorId,
  buscarCompletoPorId,
  buscarEmailEmUso,
  atualizarSenha,
  atualizarDados,
}
