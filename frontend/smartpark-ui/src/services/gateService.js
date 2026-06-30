import api from './api'

const gateService = {
  scan:     (qrPayload)               => api.get(`/gate/scan?qr=${encodeURIComponent(qrPayload)}`).then(r => r.data),
  checkIn:  (qrPayload)               => api.post('/gate/checkin',  { qrPayload }).then(r => r.data),
  checkOut: (qrPayload, overstayPaid) => api.post('/gate/checkout', { qrPayload, overstayPaid }).then(r => r.data),
}

export default gateService
