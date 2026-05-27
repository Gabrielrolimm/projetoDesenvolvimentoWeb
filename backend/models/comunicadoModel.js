const mongoose = require('mongoose')

const comunicadoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },

    conteudo: {
      type: String,
      required: true,
      trim: true,
    },

    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Comunicado', comunicadoSchema)