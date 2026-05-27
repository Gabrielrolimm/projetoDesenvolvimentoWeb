const express = require('express')
const router = express.Router()
const { listar, publicar, remover } = require('../controllers/comunicadosController')

router.get('/', listar)
router.post('/', publicar)
router.delete('/:id', remover)

module.exports = router