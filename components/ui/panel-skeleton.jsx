const Block = ({ className = "", style }) => <div style={style} className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />;

const Card = ({ className = "", children }) => <div className={`flex min-w-0 flex-col gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-4 sm:p-6 ${className}`}>{children}</div>;

const Header = ({ back }) => (
  <div className="flex flex-col gap-4 border-b border-white/5 p-5 md:flex-row md:items-center md:justify-between lg:p-8">
    <div className="flex flex-col gap-2.5">
      {back && <Block className="h-3.5 w-28" />}
      <Block className="h-9 w-56 sm:w-72" />
      <Block className="h-4 w-44 sm:w-64" />
    </div>
    <div className="flex items-center gap-3">
      <Block className="h-11 flex-1 rounded-full md:w-72 md:flex-none" />
      <Block className="size-11 shrink-0 rounded-full" />
    </div>
  </div>
);

const Stats = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex flex-col gap-3 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-4 sm:flex-row sm:items-center sm:p-5">
        <Block className="size-10 shrink-0 rounded-2xl sm:size-12" />
        <div className="flex w-full flex-col gap-2">
          <Block className="h-6 w-16" />
          <Block className="h-3.5 w-24" />
        </div>
      </div>
    ))}
  </div>
);

const Rows = ({ count = 4 }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-3">
        <Block className="size-10 shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <Block className="h-4 w-3/5" />
          <Block className="h-3 w-2/5" />
        </div>
      </div>
    ))}
  </div>
);

const CardTitle = () => <Block className="h-6 w-40" />;

const Table = () => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-wrap gap-2">
      {[20, 16, 18, 14].map((w, i) => (
        <Block key={i} className="h-8 rounded-full" style={{ width: `${w * 4}px` }} />
      ))}
    </div>
    <Block className="h-11 w-full rounded-full sm:max-w-sm" />
    <div className="hidden overflow-hidden rounded-2xl border border-[#302C2A] md:block">
      <div className="flex gap-6 bg-white/[0.03] px-4 py-3">
        {[3, 1, 1, 1, 1].map((f, i) => (
          <Block key={i} className="h-3.5" style={{ flex: f }} />
        ))}
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-6 border-t border-[#302C2A] px-4 py-4">
          <div className="flex flex-[3] items-center gap-3">
            <Block className="size-10 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Block className="h-4 w-3/5" />
              <Block className="h-3 w-2/5" />
            </div>
          </div>
          {[1, 1, 1, 1].map((f, j) => (
            <Block key={j} className="h-4" style={{ flex: f }} />
          ))}
        </div>
      ))}
    </div>
    <div className="flex flex-col gap-3 md:hidden">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#302C2A] bg-[#0C0C0C] p-3">
          <Block className="size-10 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Block className="h-4 w-3/5" />
            <Block className="h-3 w-2/5" />
          </div>
          <Block className="size-8 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const Fields = ({ count = 6 }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Block className="h-4 w-24" />
        <Block className="h-12 w-full" />
      </div>
    ))}
    <Block className="h-28 w-full md:col-span-2" />
    <Block className="h-12 w-40 rounded-2xl" />
  </div>
);

const Tabs = () => (
  <div className="flex gap-2">
    {[24, 20, 22].map((w, i) => (
      <Block key={i} className="h-10 rounded-full" style={{ width: `${w * 4}px` }} />
    ))}
  </div>
);

const Aside = () => (
  <div className="flex min-w-0 flex-col gap-5">
    <Card>
      <CardTitle />
      <Block className="h-4 w-full" />
      <Block className="h-4 w-4/5" />
    </Card>
    <Card>
      <CardTitle />
      <Rows count={3} />
    </Card>
  </div>
);

const bodies = {
  dashboard: () => (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        <Stats />
        <Card>
          <CardTitle />
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Block key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </Card>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardTitle />
            <Block className="h-44 w-full" />
          </Card>
          <Card>
            <CardTitle />
            <Rows count={3} />
          </Card>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <Block className="h-32 rounded-3xl" />
        <Card>
          <Block className="h-64 w-full" />
        </Card>
      </div>
    </div>
  ),
  table: () => <Table />,
  form: () => (
    <div className="flex flex-col gap-5">
      <Tabs />
      <Card>
        <Fields />
      </Card>
    </div>
  ),
  detail: () => (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        <Card>
          <CardTitle />
          <Rows count={4} />
        </Card>
        <Card>
          <CardTitle />
          <Fields count={4} />
        </Card>
      </div>
      <Aside />
    </div>
  ),
  editor: () => (
    <div className="flex flex-col gap-5">
      <Tabs />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Block key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
      {[0, 1].map((i) => (
        <Card key={i}>
          <div className="flex items-center gap-3">
            <Block className="size-9 shrink-0" />
            <Block className="h-5 w-48" />
          </div>
          <Rows count={3} />
        </Card>
      ))}
    </div>
  ),
  grid: () => (
    <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-3xl border border-[#302C2A] bg-[#0C0C0C]">
          <Block className="aspect-video rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Block className="h-5 w-4/5" />
            <Block className="h-3.5 w-2/5" />
            <Block className="h-2 w-full rounded-full" />
            <Block className="h-11 w-full rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  ),
  lesson: () => (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-5">
        <Block className="aspect-video w-full rounded-2xl" />
        <div className="flex justify-between gap-3">
          <Block className="h-10 w-40 rounded-full" />
          <Block className="h-10 w-32 rounded-full" />
        </div>
        <Card>
          <CardTitle />
          <Block className="h-4 w-full" />
          <Block className="h-4 w-3/4" />
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <Block className="h-20 rounded-3xl" />
        {[0, 1].map((i) => (
          <Card key={i}>
            <Rows count={3} />
          </Card>
        ))}
      </div>
    </div>
  ),
  report: () => (
    <div className="flex flex-col gap-5">
      <Stats />
      <Card>
        <CardTitle />
        <Rows count={3} />
      </Card>
      <Table />
    </div>
  ),
  list: () => (
    <div className="grid gap-5 lg:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <CardTitle />
          <Rows count={3} />
        </Card>
      ))}
    </div>
  ),
};

const PanelSkeleton = ({ variant = "dashboard", back = variant !== "dashboard" && variant !== "table" && variant !== "grid" }) => {
  const Body = bodies[variant] ?? bodies.dashboard;
  return (
    <div aria-busy="true" aria-label="Loading">
      <Header back={back} />
      <div className="p-4 sm:p-5 lg:p-8">
        <Body />
      </div>
    </div>
  );
};

export default PanelSkeleton;
