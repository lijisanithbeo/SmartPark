import api from './api'

const parkingService = {
  getLocations:          ()           => api.get('/parking-locations').then(r => r.data),
  getAllLocationsAdmin:   ()           => api.get('/parking-locations/admin/all').then(r => r.data),
  getMyLocations:        ()           => api.get('/parking-locations/my').then(r => r.data),
  getLocationById:       (id)         => api.get(`/parking-locations/${id}`).then(r => r.data),
  getLocationsByCity:    (city)       => api.get(`/parking-locations/city/${city}`).then(r => r.data),
  createLocation:        (data)       => api.post('/parking-locations', data).then(r => r.data),
  updateLocation:        (id, data)   => api.put(`/parking-locations/${id}`, data).then(r => r.data),
  deleteLocation:        (id)         => api.delete(`/parking-locations/${id}`),

  getSlotById:           (id)         => api.get(`/parking-slots/${id}`).then(r => r.data),
  getSlotsByLocation:    (locationId) => api.get(`/parking-slots/location/${locationId}`).then(r => r.data),
  getAvailableSlots:     (locationId) => api.get(`/parking-slots/location/${locationId}/available`).then(r => r.data),
  createSlot:            (data)       => api.post('/parking-slots', data).then(r => r.data),
  updateSlot:            (id, data)   => api.put(`/parking-slots/${id}`, data).then(r => r.data),
  deleteSlot:            (id)         => api.delete(`/parking-slots/${id}`),
}

export default parkingService
