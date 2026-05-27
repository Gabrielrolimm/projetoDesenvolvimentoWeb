const db = require('../db')

async function listar() {
  const [rows] = await db.query(
    `SELECT u.id, u.nome, u.email, u.ativo, u.criado_em, p.nome AS perfil
     FROM usuarios u
     JOIN perfis p ON u.perfil_id = p.id`
  )
  return rows
}

async function buscarPorId(id) {
  const [rows] = await db.query('SELECT id FROM usuarios WHERE id = ?', [id])
  return rows[0]
}

async function buscarPorEmail(email) {
  const [rows] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email])
  return rows[0]
}

async function cadastrar({ nome, email, senhaHash, perfil_id }) {
  await db.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil_id) VALUES (?, ?, ?, ?)`,
    [nome, email, senhaHash, perfil_id || 2]
  )
}

async function buscarDadosPublicosPorEmail(email) {
  const [rows] = await db.query(
    `SELECT u.id, u.nome, u.email, u.ativo, u.criado_em, p.nome AS perfil
     FROM usuarios u
     JOIN perfis p ON u.perfil_id = p.id
     WHERE u.email = ?`,
    [email]
  )
  return rows[0]
}

async function buscarDadosPublicosPorId(id) {
  const [rows] = await db.query(
    `SELECT u.id, u.nome, u.email, u.ativo, u.criado_em, p.nome AS perfil
     FROM usuarios u
     JOIN perfis p ON u.perfil_id = p.id
     WHERE u.id = ?`,
    [id]
  )
  return rows[0]
}

async function editar({ id, nome, email, perfil_id, ativo }) {
  await db.query(
    `UPDATE usuarios SET nome = ?, email = ?, perfil_id = ?, ativo = ? WHERE id = ?`,
    [nome, email, perfil_id, ativo, id]
  )
}

async function desativar(id) {
  await db.query('UPDATE usuarios SET ativo = FALSE WHERE id = ?', [id])
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorEmail,
  cadastrar,
  buscarDadosPublicosPorEmail,
  buscarDadosPublicosPorId,
  editar,
  desativar,
}
