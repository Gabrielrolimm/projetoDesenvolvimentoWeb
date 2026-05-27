const jwt = require('jsonwebtoken')
const Usuario = require('../models/usuarioModel')

async function proteger(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                mensagem: 'Token não informado.',
            })
        }

        const token = authHeader.split(' ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const usuario = await Usuario.findById(decoded.id).select('-senha_hash')

        if (!usuario || !usuario.ativo) {
            return res.status(401).json({
                mensagem: 'Usuário inválido ou inativo.',
            })
        }

        req.usuario = usuario

        next()
    } catch (error) {
        return res.status(401).json({
            mensagem: 'Token inválido.',
        })
    }
}

function somenteAdmin(req, res, next) {
    if (!req.usuario || req.usuario.perfil !== 'admin') {
        return res.status(403).json({
            mensagem: 'Acesso negado. Apenas administradores.',
        })
    }

    next()
}

module.exports = {
    proteger,
    somenteAdmin,
}