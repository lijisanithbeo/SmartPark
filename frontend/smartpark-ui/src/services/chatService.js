import api from './api'

const chatService = {
  sendMessage: (message, history = []) =>
    api.post('/chat', { message, history }).then(r => r.data),
}

export default chatService
