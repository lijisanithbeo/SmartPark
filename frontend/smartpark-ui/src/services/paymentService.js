import api from './api'

const paymentService = {
  create:          (data) => api.post('/payments', data).then(r => r.data),
  getById:         (id)   => api.get(`/payments/${id}`).then(r => r.data),
  getByReservation:(id)   => api.get(`/payments/reservation/${id}`).then(r => r.data),
  markSuccess:     (id)   => api.put(`/payments/${id}/success`).then(r => r.data),
  markFailed:      (id)   => api.put(`/payments/${id}/failed`).then(r => r.data),
}

export default paymentService
