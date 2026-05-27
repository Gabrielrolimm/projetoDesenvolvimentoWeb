const db = require('../db')

async function buscarUsuarioAtivoPorEmail(email) {
  const [rows] = await db.query(
    `SELECT u.id, u.nome, u.email, u.senha_hash, u.perfil_id, u.ativo,
            u.criado_em, u.atualizado_em, p.nome AS perfil
     FROM usuarios u
     JOIN perfis p ON u.perfil_id = p.id
     WHERE u.email = ? AND u.ativo = TRUE`,
    [email]
  )
  return rows[0]
}

module.exports = { buscarUsuarioAtivoPorEmail }
