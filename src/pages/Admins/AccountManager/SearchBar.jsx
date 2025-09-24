function SearchBar({ value, onChange, onSearch }) {
  return (
    <div className="am-search">
      <input className="am-input" placeholder="Tìm nhanh theo email" value={value} onChange={(e) => onChange(e.target.value)} />
      <button className="ad-logout" onClick={onSearch} disabled={!value?.trim()}>Tìm email</button>
    </div>
  )
}

export default SearchBar


