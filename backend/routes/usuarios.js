const express = require('express')
const router = express.Router()

const {
    listar,
    cadastrar,
    editar,
    excluir,
} = require('../controllers/usuariosController')

const {
    proteger,
    somenteAdmin,
} = require('../middleware/auth')

// Usuário logado pode listar contatos para o chat
router.get('/', proteger, listar)

// Apenas admin pode cadastrar, editar e desativar usuários
router.post('/', proteger, somenteAdmin, cadastrar)
router.put('/:id', proteger, somenteAdmin, editar)
router.delete('/:id', proteger, somenteAdmin, excluir)

module.exports = router