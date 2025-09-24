function Pagination({ total, page, totalPages, setPage, onClearSelection }) {
  return (
    <div className="am-pagination">
      <div className="am-total">Tổng: {total}</div>
      <div className="am-pager">
        <button className="ad-logout" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Trước</button>
        <div style={{ alignSelf: 'center' }}>{page} / {totalPages}</div>
        <button className="ad-logout" onClick={() => setPage(Math.max(1, Math.min(totalPages, page + 1)))} disabled={page >= totalPages}>Sau</button>
      </div>
      <button className="ad-logout am-btn-muted" onClick={onClearSelection}>Bỏ chọn</button>
    </div>
  )
}

export default Pagination


