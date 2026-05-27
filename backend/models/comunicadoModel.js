const db = require('../db')

async function listar() {
  const [rows] = await db.query(
    `SELECT c.id, c.titulo, c.conteudo, c.publicado_em, u.nome AS autor_nome
     FROM comunicados c
     JOIN usuarios u ON u.id = c.autor_id
     ORDER BY c.publicado_em DESC`
  )
  return rows
}

async function publicar({ titulo, conteudo, autor_id }) {
  await db.query(
    'INSERT INTO comunicados (titulo, conteudo, autor_id) VALUES (?, ?, ?)',
    [titulo, conteudo, autor_id]
  )
}

async function buscarMaisRecente() {
  const [rows] = await db.query(
    `SELECT c.id, c.titulo, c.conteudo, c.publicado_em, u.nome AS autor_nome
     FROM comunicados c
     JOIN usuarios u ON u.id = c.autor_id
     ORDER BY c.publicado_em DESC LIMIT 1`
  )
  return rows[0]
}

async function buscarPorId(id) {
  const [rows] = await db.query('SELECT id FROM comunicados WHERE id = ?', [id])
  return rows[0]
}

async function remover(id) {
  await db.query('DELETE FROM comunicados WHERE id = ?', [id])
}

module.exports = { listar, publicar, buscarMaisRecente, buscarPorId, remover }
