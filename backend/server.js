const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./db')

const authRoutes = require('./routes/auth')
const usuariosRoutes = require('./routes/usuarios')
const perfilRoutes = require('./routes/perfil')
const mensagensRoutes = require('./routes/mensagens')
const comunicadosRoutes = require('./routes/comunicados')
const anexosRoutes = require('./routes/anexos')

require('dotenv').config()

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
  },
  express.static(path.join(__dirname, 'uploads'))
)

app.use('/auth', authRoutes)
app.use('/usuarios', usuariosRoutes)
app.use('/perfil', perfilRoutes)
app.use('/mensagens', mensagensRoutes)
app.use('/comunicados', comunicadosRoutes)
app.use('/anexos', anexosRoutes)

app.use((err, req, res, next) => {
  console.error(err)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      mensagem: 'Arquivo muito grande. Tamanho máximo: 10MB.',
    })
  }

  if (err.message) {
    return res.status(400).json({
      mensagem: err.message,
    })
  }

  return res.status(500).json({
    mensagem: 'Erro interno do servidor.',
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})