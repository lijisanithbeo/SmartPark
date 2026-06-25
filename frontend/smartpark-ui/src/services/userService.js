import api from './api'

const userService = {
  getAll:       ()          => api.get('/users').then(r => r.data),
  getByRole:    (role)      => api.get(`/users/role/${role}`).then(r => r.data),
  getById:      (id)        => api.get(`/users/${id}`).then(r => r.data),
  toggleActive: (id)        => api.put(`/users/${id}/toggle-active`).then(r => r.data),
  updateUser:   (id, data)  => api.put(`/users/${id}`, data).then(r => r.data),
  getMe:        ()          => api.get('/users/me').then(r => r.data),
  updateMe:     (data)      => api.put('/users/me', data).then(r => r.data),
}

export default userService
