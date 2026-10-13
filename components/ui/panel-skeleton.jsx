const PanelSkeleton = () => (
  <div className="flex flex-col gap-4 p-6 lg:p-10" aria-busy="true" aria-label="Loading">
    <div className="h-10 w-64 animate-pulse rounded-xl bg-white/5" />
    <div className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
    <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
  </div>
);

export default PanelSkeleton;
