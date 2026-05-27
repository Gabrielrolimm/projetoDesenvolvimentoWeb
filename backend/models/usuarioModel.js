const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    senha_hash: {
      type: String,
      required: true,
    },

    perfil: {
      type: String,
      enum: ['admin', 'usuario'],
      default: 'usuario',
    },

    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Usuario', usuarioSchema)