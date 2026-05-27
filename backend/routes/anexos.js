const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { enviar, download, listarPorMensagem } = require('../controllers/anexosController')

router.post('/', upload.single('arquivo'), (req, res, next) => {
  // Trata erros do multer (tipo inválido, tamanho excedido)
  next()
}, enviar)

router.use((err, req, res, next) => {
  if (err.message) {
    return res.status(400).json({ mensagem: err.message })
  }
  next(err)
})

router.get('/download/:id', download)
router.get('/mensagem/:mensagemId', listarPorMensagem)

module.exports = router