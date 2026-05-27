import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  if (usuario) {
    config.headers['x-usuario-id'] = usuario.id
  }
  return config
})

export default api