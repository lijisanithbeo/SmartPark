import api from './api'

const authService = {
  register:       (data)                  => api.post('/auth/register', data).then(r => r.data),
  login:          (data)                  => api.post('/auth/login', data).then(r => r.data),
  forgotPassword: (email)                 => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword:  (token, newPassword)    => api.post('/auth/reset-password', { token, newPassword }).then(r => r.data),
}

export default authService
