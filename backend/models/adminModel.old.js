const db = require('../db')

async function verificarAdmin(solicitante_id) {
  const [rows] = await db.query(
    `SELECT p.nome AS perfil FROM usuarios u
     JOIN perfis p ON u.perfil_id = p.id
     WHERE u.id = ?`,
    [solicitante_id]
  )
  return rows.length > 0 && rows[0].perfil === 'admin'
}

module.exports = { verificarAdmin }
