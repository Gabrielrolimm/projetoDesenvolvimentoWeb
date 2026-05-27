const express = require('express')
const router = express.Router()
const { buscar, atualizar } = require('../controllers/perfilController')

router.get('/:id', buscar)
router.put('/:id', atualizar)

module.exports = router