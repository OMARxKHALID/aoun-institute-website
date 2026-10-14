import { ChevronLeft, ChevronRight } from "lucide-react";

const pageButton = "grid size-9 place-items-center rounded-full border border-[#302C2A] transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30";

const Pager = ({ from, to, total, page, pages, onPrev, onNext }) => {
  if (!total) return null;
  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm text-white/60 sm:flex-row">
      <p>
        Showing <span className="text-white">{from}</span>–<span className="text-white">{to}</span> of <span className="text-white">{total}</span>
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-3">
          <button type="button" onClick={onPrev} disabled={page === 0} aria-label="Previous page" className={pageButton}>
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-16 text-center">
            {page + 1} / {pages}
          </span>
          <button type="button" onClick={onNext} disabled={page >= pages - 1} aria-label="Next page" className={pageButton}>
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pager;
