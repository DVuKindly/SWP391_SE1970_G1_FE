import apiClient from './apiClient'

/**
 * 📊 API Service cho Revenue Management
 * Dựa trên các endpoint từ backend:
 * - GET /api/revenue/patient-list
 * - GET /api/revenue/payment-overview
 * - GET /api/revenue/payments
 * - GET /api/revenue/by-month
 * - GET /api/revenue/by-year
 * - GET /api/revenue/export-excel
 */

/**
 * Lấy danh sách bệnh nhân đã thanh toán
 * @param {object} tokens - Authentication tokens
 * @returns {Promise} - Danh sách bệnh nhân
 */
export const getPatientList = async (tokens) => {
  const response = await apiClient.get('/api/revenue/patient-list', {
    tokens,
  })
  return response
}

/**
 * Lấy tổng quan thanh toán (Payment Overview)
 * @param {object} tokens - Authentication tokens
 * @returns {Promise} - Tổng quan thanh toán
 */
export const getPaymentOverview = async (tokens) => {
  const response = await apiClient.get('/api/revenue/payment-overview', {
    tokens,
  })
  return response
}

/**
 * Lấy danh sách thanh toán
 * @param {object} tokens - Authentication tokens
 * @returns {Promise} - Danh sách thanh toán
 */
export const getPayments = async (tokens) => {
  const response = await apiClient.get('/api/revenue/payments', {
    tokens,
  })
  return response
}

/**
 * Lấy doanh thu theo tháng
 * @param {number} year - Năm cần lấy doanh thu
 * @param {object} tokens - Authentication tokens
 * @returns {Promise} - Doanh thu theo từng tháng
 */
export const getRevenueByMonth = async (year, tokens) => {
  const response = await apiClient.get('/api/revenue/by-month', {
    tokens,
    query: { year },
  })
  return response
}

/**
 * Lấy doanh thu theo năm
 * @param {number} fromYear - Năm bắt đầu (mặc định: 5 năm trước)
 * @param {number} toYear - Năm kết thúc (mặc định: năm hiện tại)
 * @param {object} tokens - Authentication tokens
 * @returns {Promise} - Doanh thu theo năm
 */
export const getRevenueByYear = async (fromYear, toYear, tokens) => {
  const currentYear = new Date().getFullYear()
  const from = fromYear || (currentYear - 4)
  const to = toYear || currentYear
  
  const response = await apiClient.get('/api/revenue/by-year', {
    tokens,
    query: { fromYear: from, toYear: to },
  })
  return response
}

/**
 * Export dữ liệu doanh thu ra file Excel
 * @param {object} params - Tham số filter (year, month, etc.)
 * @param {object} tokens - Authentication tokens
 * @returns {Promise} - File Excel download
 */
export const exportRevenueExcel = async (params, tokens) => {
  // Gọi API với fetch trực tiếp để xử lý blob
  const queryParams = new URLSearchParams()
  if (params.year) queryParams.append('year', params.year)
  if (params.isPaid !== undefined) queryParams.append('isPaid', params.isPaid)
  
  const response = await fetch(`/api/revenue/export-excel?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
  })
  
  if (!response.ok) {
    throw new Error('Export failed')
  }
  
  const blob = await response.blob()
  
  // Tự động download file
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
  
  return blob
}
