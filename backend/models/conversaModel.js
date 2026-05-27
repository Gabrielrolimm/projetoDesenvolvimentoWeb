const mongoose = require('mongoose')

const conversaSchema = new mongoose.Schema(
    {
        participantes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Usuario',
                required: true,
            },
        ],

        criado_por: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Conversa', conversaSchema)