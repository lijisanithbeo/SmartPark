import api from './api'

const reservationService = {
  create:      (data)   => api.post('/reservations', data).then(r => r.data),
  getById:     (id)     => api.get(`/reservations/${id}`).then(r => r.data),
  getByUser:   (userId) => api.get(`/reservations/user/${userId}`).then(r => r.data),
  cancel:      (id)     => api.put(`/reservations/${id}/cancel`).then(r => r.data),
  confirm:     (id)     => api.put(`/reservations/${id}/confirm`).then(r => r.data),
  pay:         (id, data) => api.post(`/reservations/${id}/pay`, data).then(r => r.data),
  getQrCode:   (id)     => api.get(`/reservations/${id}/qr-code`).then(r => r.data),
}

export default reservationService
