const express = require('express')
const router = express.Router()

const {
    buscar,
    atualizar,
} = require('../controllers/perfilController')

const {
    proteger,
} = require('../middleware/auth')

router.get('/:id', proteger, buscar)
router.put('/:id', proteger, atualizar)

module.exports = router