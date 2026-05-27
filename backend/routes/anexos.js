const express = require('express')
const router = express.Router()

const upload = require('../middleware/upload')

const {
  enviar,
  download,
  listarPorMensagem,
} = require('../controllers/anexosController')

const {
  proteger,
} = require('../middleware/auth')

router.post('/', proteger, upload.single('arquivo'), enviar)

router.get('/download/:id', download)

router.get('/mensagem/:mensagemId', proteger, listarPorMensagem)

router.use((err, req, res, next) => {
  if (err.message) {
    return res.status(400).json({
      mensagem: err.message,
    })
  }

  next(err)
})

module.exports = router