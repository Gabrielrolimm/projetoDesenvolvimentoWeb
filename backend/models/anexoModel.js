const mongoose = require('mongoose')

const anexoSchema = new mongoose.Schema(
  {
    mensagem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mensagem',
      required: true,
    },

    nome_arquivo: {
      type: String,
      required: true,
    },

    tipo_mime: {
      type: String,
      required: true,
    },

    tamanho_bytes: {
      type: Number,
      required: true,
    },

    caminho: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Anexo', anexoSchema)