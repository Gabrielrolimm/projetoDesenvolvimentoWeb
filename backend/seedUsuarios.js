const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config()

const Usuario = require('./models/usuarioModel')

const usuarios = [
    {
        nome: 'Administrador',
        email: 'admin@scijf.com',
        senha: '123456',
        perfil: 'admin',
    },
    {
        nome: 'João Silva',
        email: 'joao@scijf.com',
        senha: '123456',
        perfil: 'usuario',
    },
    {
        nome: 'Maria Oliveira',
        email: 'maria@scijf.com',
        senha: '123456',
        perfil: 'usuario',
    },
    {
        nome: 'Ana Souza',
        email: 'ana@scijf.com',
        senha: '123456',
        perfil: 'usuario',
    },
    {
        nome: 'Carlos Pereira',
        email: 'carlos@scijf.com',
        senha: '123456',
        perfil: 'usuario',
    },
    {
        nome: 'Fernanda Lima',
        email: 'fernanda@scijf.com',
        senha: '123456',
        perfil: 'usuario',
    },
]

async function seedUsuarios() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('A variável MONGO_URI não está definida no arquivo .env.')
        }

        await mongoose.connect(process.env.MONGO_URI)

        console.log('MongoDB conectado.')

        for (const dadosUsuario of usuarios) {
            const usuarioExistente = await Usuario.findOne({
                email: dadosUsuario.email,
            })

            if (usuarioExistente) {
                console.log(`Usuário já existe: ${dadosUsuario.email}`)
                continue
            }

            const senhaHash = await bcrypt.hash(dadosUsuario.senha, 10)

            await Usuario.create({
                nome: dadosUsuario.nome,
                email: dadosUsuario.email,
                senha_hash: senhaHash,
                perfil: dadosUsuario.perfil,
                ativo: true,
            })

            console.log(`Usuário criado: ${dadosUsuario.email}`)
        }

        console.log('Seed de usuários finalizado com sucesso.')
        process.exit(0)
    } catch (error) {
        console.error('Erro ao alimentar usuários:', error.message)
        process.exit(1)
    }
}

seedUsuarios()