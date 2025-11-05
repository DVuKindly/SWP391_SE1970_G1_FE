import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../providers/AuthContext'
import {
  getPatientList,
  getPaymentOverview,
  getPayments,
  getRevenueByMonth,
  getRevenueByYear,
  exportRevenueExcel,
} from '../../services/revenue.api'
import './RevenueDashboard.css'

/**
 * 📊 Revenue Dashboard - Màn hình quản lý doanh thu
 * 
 * Chức năng chính:
 * - Hiển thị tổng quan thanh toán (tổng doanh thu, số lượng thanh toán, v.v.)
 * - Biểu đồ doanh thu theo tháng/năm
 * - Danh sách chi tiết các giao dịch thanh toán
 * - Danh sách bệnh nhân đã thanh toán
 * - Export báo cáo Excel
 */

function RevenueDashboard() {
  const { tokens } = useContext(AuthContext)

  // ⚙️ State quản lý data
  const [overview, setOverview] = useState({})
  const [payments, setPayments] = useState([])
  const [patients, setPatients] = useState([])
  const [revenueByMonth, setRevenueByMonth] = useState([])
  const [revenueByYear, setRevenueByYear] = useState([])
  
  // ⚙️ State UI
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview | payments | patients
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [exporting, setExporting] = useState(false)

  // 🔄 Load dữ liệu tổng quan khi component mount
  useEffect(() => {
    console.log('🚀 Revenue Dashboard mounted, loading data...')
    console.log('🔑 Tokens:', tokens ? 'Available' : 'Missing')
    loadOverview()
    loadPayments()
    loadPatients()
    loadRevenueByYear()
  }, [])

  // 🔄 Load doanh thu theo tháng khi đổi năm
  useEffect(() => {
    loadRevenueByMonth(selectedYear)
  }, [selectedYear])

  /**
   * 📥 Load tổng quan thanh toán
   */
  const loadOverview = async () => {
    setLoading(true)
    try {
      console.log('🔄 Calling getPaymentOverview with tokens:', tokens ? 'Present' : 'Missing')
      const response = await getPaymentOverview(tokens)
      console.log('📊 Raw Payment Overview response:', response)
      console.log('📊 Type:', typeof response, 'IsArray:', Array.isArray(response))
      console.log('📊 Keys:', response ? Object.keys(response) : 'null')
      
      // Backend trả về { success, message, data: {...} }
      // apiClient có thể đã unwrap hoặc chưa
      let data = response
      if (response && response.data) {
        console.log('📊 Found nested data property, unwrapping...')
        data = response.data
      }
      
      console.log('📊 Final data to set:', data)
      setOverview(data || {})
      console.log('✅ Overview state updated with:', data)
    } catch (error) {
      console.error('❌ Error loading payment overview:', error)
      console.error('❌ Error details:', error.message, error.response)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 📥 Load danh sách thanh toán
   */
  const loadPayments = async () => {
    try {
      const response = await getPayments(tokens)
      console.log('💳 Raw Payments response:', response)
      const data = response?.data || response
      console.log('💳 Payments data:', data)
      setPayments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error loading payments:', error)
    }
  }

  /**
   * 📥 Load danh sách bệnh nhân
   */
  const loadPatients = async () => {
    try {
      const response = await getPatientList(tokens)
      console.log('👥 Raw Patients response:', response)
      const data = response?.data || response
      console.log('👥 Patients data:', data)
      
      // Backend trả về { TotalPatients, PaidTotal, UnpaidTotal, Patients }
      let rawList = []
      if (data?.Patients) {
        rawList = Array.isArray(data.Patients) ? data.Patients : []
      } else if (data?.patients) {
        rawList = Array.isArray(data.patients) ? data.patients : []
      } else if (Array.isArray(data)) {
        rawList = data
      }

      console.log('👥 Raw patient list:', rawList)

      // Group theo email để tính số lần khám và tổng thanh toán
      const patientMap = new Map()
      
      rawList.forEach(item => {
        const email = item.patientEmail || item.email
        if (!email) return
        
        if (!patientMap.has(email)) {
          patientMap.set(email, {
            patientName: item.patientName || item.fullName || item.name,
            patientEmail: email,
            patientPhone: item.patientPhone || item.phone || 'N/A',
            totalPaid: 0,
            visitCount: 0,
            firstVisit: item.startTime || item.createdAt,
            appointments: []
          })
        }
        
        const patient = patientMap.get(email)
        patient.appointments.push(item)
        
        // Chỉ tính appointment đã thanh toán và đã khám (isPaid = true)
        if (item.isPaid) {
          patient.totalPaid += (item.amount || 0)
          patient.visitCount += 1
        }
      })
      
      // Convert Map to Array
      const groupedPatients = Array.from(patientMap.values())
      console.log('👥 Grouped patients:', groupedPatients)
      
      setPatients(groupedPatients)
    } catch (error) {
      console.error('❌ Error loading patient list:', error)
    }
  }

  /**
   * 📥 Load doanh thu theo tháng
   */
  const loadRevenueByMonth = async (year) => {
    try {
      const response = await getRevenueByMonth(year, tokens)
      console.log('📈 Raw Revenue by month response:', response)
      const data = response?.data || response
      console.log('📈 Revenue by month data:', data)
      setRevenueByMonth(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error loading revenue by month:', error)
    }
  }

  /**
   * 📥 Load doanh thu theo năm
   */
  const loadRevenueByYear = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const response = await getRevenueByYear(currentYear - 4, currentYear, tokens)
      console.log('📊 Raw Revenue by year response:', response)
      const data = response?.data || response
      console.log('📊 Revenue by year data:', data)
      setRevenueByYear(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Error loading revenue by year:', error)
    }
  }

  /**
   * 📤 Export báo cáo Excel
   */
  const handleExportExcel = async () => {
    setExporting(true)
    try {
      await exportRevenueExcel({ year: selectedYear }, tokens)
      alert('Xuất báo cáo thành công!')
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Không thể xuất báo cáo: ' + (error?.response?.data?.message || error?.message))
    } finally {
      setExporting(false)
    }
  }

  /**
   * 💰 Format tiền VND
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount || 0)
  }

  /**
   * 📅 Format ngày tháng
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  /**
   * 📊 Render biểu đồ đơn giản (bar chart)
   */
  const renderSimpleChart = (data) => {
    if (!data || data.length === 0) {
      return <div className="rd-empty-chart">Không có dữ liệu</div>
    }

    const maxValue = Math.max(...data.map(item => 
      item.totalRevenue || item.revenue || item.TotalRevenue || item.Revenue || 0
    ))
    
    return (
      <div className="rd-chart">
        {data.map((item, index) => {
          const revenue = item.totalRevenue || item.revenue || item.TotalRevenue || item.Revenue || 0
          const percentage = maxValue > 0 ? (revenue / maxValue) * 100 : 0
          const label = item.month || item.Month 
            ? `Tháng ${item.month || item.Month}` 
            : `Năm ${item.year || item.Year}`
          
          return (
            <div key={index} className="rd-chart-item">
              <div className="rd-chart-label">{label}</div>
              <div className="rd-chart-bar-container">
                <div 
                  className="rd-chart-bar" 
                  style={{ width: `${percentage}%` }}
                  title={formatCurrency(revenue)}
                >
                  <span className="rd-chart-value">{formatCurrency(revenue)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="rd-container">
      {/* 🎯 Header với Export button */}
      <div className="rd-header">
        <h2>📊 Quản Lý Doanh Thu</h2>
        <button 
          className="rd-btn rd-btn-export" 
          onClick={handleExportExcel}
          disabled={exporting}
        >
          {exporting ? '⏳ Đang xuất...' : '📥 Xuất Excel'}
        </button>
      </div>

      {/* 📑 Tab Navigation */}
      <div className="rd-tabs">
        <button 
          className={`rd-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Tổng Quan
        </button>
        <button 
          className={`rd-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          💳 Danh Sách Thanh Toán
        </button>
        <button 
          className={`rd-tab ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          👥 Danh Sách Bệnh Nhân
        </button>
      </div>

      {/* 📊 Overview Tab */}
      {activeTab === 'overview' && (
        <div className="rd-content">
          {loading ? (
            <div className="rd-loading">Đang tải dữ liệu...</div>
          ) : !overview ? (
            <div className="rd-loading">Không có dữ liệu tổng quan</div>
          ) : (
            <>
              {/* 💰 Cards tổng quan */}
              <div className="rd-stats-grid">
                <div className="rd-stat-card">
                  <div className="rd-stat-icon">💰</div>
                  <div className="rd-stat-info">
                    <div className="rd-stat-label">Tổng Doanh Thu</div>
                    <div className="rd-stat-value">
                      {overview ? formatCurrency(overview.totalPaid || overview.grandTotal || 0) : '0 ₫'}
                    </div>
                  </div>
                </div>

                <div className="rd-stat-card">
                  <div className="rd-stat-icon">📝</div>
                  <div className="rd-stat-info">
                    <div className="rd-stat-label">Đã Thanh Toán</div>
                    <div className="rd-stat-value">
                      {overview ? (overview.countPaid || overview.grandCount || 0) : 0}
                    </div>
                  </div>
                </div>

                <div className="rd-stat-card">
                  <div className="rd-stat-icon">⏳</div>
                  <div className="rd-stat-info">
                    <div className="rd-stat-label">Chưa Thanh Toán</div>
                    <div className="rd-stat-value">
                      {overview ? formatCurrency(overview.totalUnpaid || 0) : '0 ₫'}
                    </div>
                  </div>
                </div>

                <div className="rd-stat-card">
                  <div className="rd-stat-icon">📊</div>
                  <div className="rd-stat-info">
                    <div className="rd-stat-label">Số Lượng Chưa TT</div>
                    <div className="rd-stat-value">
                      {overview ? (overview.countUnpaid || 0) : 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* 📊 Biểu đồ doanh thu theo tháng */}
              <div className="rd-chart-section">
                <div className="rd-chart-header">
                  <h3>📈 Doanh Thu Theo Tháng</h3>
                  <select 
                    className="rd-select" 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {renderSimpleChart(revenueByMonth)}
              </div>

              {/* 📊 Biểu đồ doanh thu theo năm */}
              <div className="rd-chart-section">
                <h3>📈 Doanh Thu Theo Năm</h3>
                {renderSimpleChart(revenueByYear)}
              </div>
            </>
          )}
        </div>
      )}

      {/* 💳 Payments Tab */}
      {activeTab === 'payments' && (
        <div className="rd-content">
          <div className="rd-table-container">
            <table className="rd-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bệnh Nhân</th>
                  <th>Email</th>
                  <th>Bác Sĩ</th>
                  <th>Gói Khám</th>
                  <th>Số Tiền</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Hẹn</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="rd-empty">Không có dữ liệu thanh toán</td>
                  </tr>
                ) : (
                  payments.map((payment, index) => {
                    console.log('🔍 Payment item:', payment)
                    return (
                      <tr key={payment.appointmentId || payment.id || index}>
                        <td>{index + 1}</td>
                        <td>{payment.patientName || payment.fullName || 'N/A'}</td>
                        <td>{payment.patientEmail || payment.email || 'N/A'}</td>
                        <td>{payment.doctorName || 'N/A'}</td>
                        <td>{payment.examName || payment.packageName || 'N/A'}</td>
                        <td className="rd-amount">{formatCurrency(payment.amount || payment.price || 0)}</td>
                        <td>
                          <span className={`rd-badge ${payment.isPaid ? 'rd-badge-paid' : 'rd-badge-pending'}`}>
                            {payment.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </span>
                        </td>
                        <td>{formatDate(payment.startTime || payment.paymentDate || payment.createdAt)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 👥 Patients Tab */}
      {activeTab === 'patients' && (
        <div className="rd-content">
          <div className="rd-table-container">
            <table className="rd-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Họ Tên</th>
                  <th>Email</th>
                  <th>Tổng Thanh Toán</th>
                  <th>Số Lần Khám</th>
                  <th>Lần Đầu Đăng Ký</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="rd-empty">Không có dữ liệu bệnh nhân</td>
                  </tr>
                ) : (
                  patients.map((patient, index) => (
                    <tr key={patient.patientEmail || index}>
                      <td>{index + 1}</td>
                      <td>{patient.patientName || 'N/A'}</td>
                      <td>{patient.patientEmail || 'N/A'}</td>
                      <td className="rd-amount">
                        {formatCurrency(patient.totalPaid || 0)}
                      </td>
                      <td>{patient.visitCount || 0}</td>
                      <td>{formatDate(patient.firstVisit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueDashboard
