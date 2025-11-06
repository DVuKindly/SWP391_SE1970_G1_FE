import apiClient from './apiClient'

/**
 * API Service cho Revenue Management
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
  try {
    // Gọi API với fetch trực tiếp để xử lý blob
    const queryParams = new URLSearchParams()
    if (params.year) queryParams.append('year', params.year)
    if (params.isPaid !== undefined) queryParams.append('isPaid', params.isPaid)
    
    const url = `/api/revenue/export-excel${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('Exporting Excel from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens?.accessToken}`,
      },
    })
    
    console.log('Export response status:', response.status)
    console.log('Export response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      // Thử parse error message từ JSON hoặc text
      const contentType = response.headers.get('content-type') || ''
      let errorMessage = `Export failed with status ${response.status}`
      
      try {
        if (contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } else if (contentType.includes('text/plain') || contentType.includes('text/html')) {
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError)
      }
      
      console.error('Export failed:', errorMessage)
      throw new Error(errorMessage)
    }
    
    const blob = await response.blob()
    console.log(' Blob size:', blob.size, 'bytes')
    
    // Tự động download file
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    
    // Lấy tên file từ header Content-Disposition nếu có
    const contentDisposition = response.headers.get('content-disposition')
    let fileName = `export-excel-year-${params.year || new Date().getFullYear()}.xlsx`
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '')
      }
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
    
    console.log('File downloaded successfully:', fileName)
    return blob
  } catch (error) {
    console.error('Export Excel error:', error)
    throw error
  }
}
