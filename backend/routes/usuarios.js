const express = require('express')
const router = express.Router()
const { listar, cadastrar, editar, excluir } = require('../controllers/usuariosController')

router.get('/', listar)
router.post('/', cadastrar)
router.put('/:id', editar)
router.delete('/:id', excluir)

module.exports = router