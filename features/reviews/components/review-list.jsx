import Stars from "@/components/ui/stars";
import { formatDate, plural } from "@/lib/format";

const Frame = ({ className = "", children }) => (
  <div className={`rounded-2xl bg-linear-to-b from-[#666666] to-black to-40% p-[.5px] ${className}`}>
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-black p-6 text-[#D3D3D3] md:p-8">{children}</div>
  </div>
);

const ReviewList = ({ rating, reviews }) => (
  <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
    <Frame className="lg:sticky lg:top-36">
      <p className="font-machina text-7xl leading-none text-white">{rating.average.toFixed(1)}</p>
      <Stars value={rating.average} size="size-5" />
      <p className="text-[#797979]">Based on {plural(rating.count, "review")}</p>
      <ul className="flex flex-col gap-2 border-t border-white/20 pt-4">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = rating.distribution[n - 1];
          return (
            <li key={n} className="flex items-center gap-3 text-sm text-[#797979]">
              <span className="w-12">{plural(n, "star")}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <span style={{ width: `${(count / rating.count) * 100}%` }} className="block h-full rounded-full bg-linear-to-r from-[#E8602E] to-[#A8401A]" />
              </span>
              <span className="w-6 text-right">{count}</span>
            </li>
          );
        })}
      </ul>
    </Frame>
    <ul className="grid gap-6 md:grid-cols-2">
      {reviews.map((r) => (
        <li key={r.id}>
          <Frame className="h-full">
            <div className="flex items-center gap-4 border-b border-white/20 pb-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-linear-to-br from-accent to-stone-800 text-xl font-semibold text-white">{r.studentName?.[0]}</span>
              <div className="min-w-0">
                <p className="truncate text-lg font-medium text-white">{r.studentName}</p>
                <p className="text-sm text-[#797979]">{formatDate(r.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#797979]">
              {r.rating.toFixed(1)}
              <Stars value={r.rating} />
            </div>
            {r.body && <p className="whitespace-pre-line break-words text-lg font-light">{r.body}</p>}
            {r.reply?.body && (
              <div className="mt-auto rounded-xl border border-accent/30 bg-[#4B1E0E]/30 p-4 text-sm">
                <p className="mb-1 font-medium text-accent">Reply from the institute</p>
                <p className="whitespace-pre-line text-white/70">{r.reply.body}</p>
              </div>
            )}
          </Frame>
        </li>
      ))}
    </ul>
  </div>
);

export default ReviewList;
