import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 120000
})

// Performance
export const runHotelBooking = () => api.post('/run/hotel-booking')
export const runSearchWidget = () => api.post('/run/search-widget')
export const runReservationSummary = () => api.post('/run/reservation-summary')
export const runDisplayReservation = () => api.post('/run/display-reservation')

// Reports
export const sendAgentReport = (rptType) =>
  api.post('/reports/agent', { rpt_type: rptType })

export const consolidateReports = () =>
  api.get('/reports/consolidate')

// Files
export const getPerformanceFiles = () =>
  api.get('/reports/list-html-reports')

// Consolidated
export const getConsolidatedList = () =>
  api.get('/reports/list')

export const compareConsolidated = (file1, file2) =>
  api.get('/reports/compare', { params: {
      a: file1,
      b: file2
    } 
})
