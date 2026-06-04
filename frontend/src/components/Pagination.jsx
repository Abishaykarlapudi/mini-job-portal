export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const nums = [];
    for (let i = 1; i <= pages; i++) {
      if (
        i === 1 || i === pages ||
        (i >= page - 1 && i <= page + 1)
      ) {
        nums.push(i);
      } else if (nums[nums.length - 1] !== '...') {
        nums.push('...');
      }
    }
    return nums;
  };

  return (
    <div className="pagination" id="pagination">
      <button
        className="page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        id="prev-page-btn"
        title="Previous page"
      >
        ‹
      </button>

      {getPageNumbers().map((num, idx) =>
        num === '...' ? (
          <span key={`ellipsis-${idx}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={num}
            className={`page-btn ${num === page ? 'active' : ''}`}
            onClick={() => onPageChange(num)}
            id={`page-btn-${num}`}
          >
            {num}
          </button>
        )
      )}

      <button
        className="page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        id="next-page-btn"
        title="Next page"
      >
        ›
      </button>
    </div>
  );
}
