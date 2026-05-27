const express = require('express')
const router = express.Router()

const {
    listarConversas,
    listarHistorico,
    enviar,
    excluir,
} = require('../controllers/mensagensController')

const {
    proteger,
} = require('../middleware/auth')

router.get('/conversas/:usuarioId', proteger, listarConversas)
router.get('/historico/:conversaId', proteger, listarHistorico)
router.post('/', proteger, enviar)
router.delete('/:id', proteger, excluir)

module.exports = router