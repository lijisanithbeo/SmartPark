import api from './api'

const pricingService = {
  getEstimate(slotId, startTime, endTime) {
    return api.get('/pricing/estimate', {
      params: { slotId, startTime, endTime },
    }).then(r => r.data)
  },

  getDemand(locationId) {
    return api.get(`/pricing/demand/${locationId}`).then(r => r.data)
  },

  getConfig(locationId) {
    return api.get(`/pricing/config/${locationId}`).then(r => r.data)
  },

  saveConfig(locationId, data) {
    return api.put(`/pricing/config/${locationId}`, data).then(r => r.data)
  },
}

export default pricingService
