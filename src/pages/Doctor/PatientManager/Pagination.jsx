function Pagination({ total, page, totalPages, setPage, hasNextPage }) {
  return (
    <div className="am-pagination">
      <div className="am-total">Tổng: {total}</div>
      <div className="am-pager">
        <button className="ad-logout" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Trước</button>
        <div style={{ alignSelf: 'center' }}>{page} / {totalPages}</div>
        <button
          className="ad-logout"
          onClick={() => setPage(page + 1)}
          disabled={!(page < totalPages || hasNextPage)}
        >Sau</button>
      </div>
    </div>
  )
}

export default Pagination


