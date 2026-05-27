const express = require('express')
const router = express.Router()
const { listarConversas, listarHistorico, enviar, excluir } = require('../controllers/mensagensController')

router.get('/conversas/:usuarioId', listarConversas)
router.get('/historico/:conversaId', listarHistorico)
router.post('/', enviar)
router.delete('/:id', excluir)

module.exports = router