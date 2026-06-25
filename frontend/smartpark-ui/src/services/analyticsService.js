import api from './api'

const analyticsService = {
  getDashboardStats: () => api.get('/analytics/dashboard-stats').then(r => r.data),
  getPeakHours: () => api.get('/analytics/peak-hours').then(r => r.data),
  getPeakDays: () => api.get('/analytics/peak-days').then(r => r.data),
  getReservationTrend: (days = 30) => api.get(`/analytics/reservation-trend?days=${days}`).then(r => r.data),
  getRevenueTrend: (days = 30) => api.get(`/analytics/revenue-trend?days=${days}`).then(r => r.data),
  getOccupancyTrend: (days = 30) => api.get(`/analytics/occupancy-trend?days=${days}`).then(r => r.data),
  getLocationPerformance: () => api.get('/analytics/location-performance').then(r => r.data),

  // Owner-scoped
  getOwnerDashboardStats: () => api.get('/owner/dashboard-stats').then(r => r.data),
  getOwnerReservations:   () => api.get('/owner/reservations').then(r => r.data),
}
export default analyticsService
