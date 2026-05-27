const express = require('express')
const router = express.Router()

const {
    listar,
    publicar,
    remover,
} = require('../controllers/comunicadosController')

const {
    proteger,
    somenteAdmin,
} = require('../middleware/auth')

router.get('/', proteger, listar)
router.post('/', proteger, somenteAdmin, publicar)
router.delete('/:id', proteger, somenteAdmin, remover)

module.exports = router