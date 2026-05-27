const mongoose = require('mongoose')

const mensagemSchema = new mongoose.Schema(
  {
    conversa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversa',
      required: true,
    },

    remetente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },

    conteudo: {
      type: String,
      required: true,
      trim: true,
    },

    lido_por: [
      {
        usuario: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Usuario',
        },

        lido_em: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    excluida: {
      type: Boolean,
      default: false,
    },

    excluida_por: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Mensagem', mensagemSchema)