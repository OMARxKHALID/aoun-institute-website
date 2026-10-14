import Link from "next/link";
import { Download, Receipt, RotateCcw, Users, Wallet } from "lucide-react";
import { RANGES, getSalesReport } from "@/features/analytics/reports";
import ReportCourseTable from "@/features/analytics/components/report-course-table";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import BarChart from "@/components/ui/bar-chart";
import ProgressBar from "@/components/ui/progress-bar";
import EmptyState from "@/components/ui/empty-state";
import { btn } from "@/lib/ui";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Reports" };

const compact = (value) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const ReportsPage = async ({ searchParams }) => {
  const { range: rangeParam } = await searchParams;
  const r = await getSalesReport(rangeParam);
  const exportLink = (
    <a href={`/api/admin/reports/orders?range=${r.range.value}`} className={btn.outline}>
      <Download className="size-4 text-accent" /> Export orders CSV
    </a>
  );
  return (
    <>
      <PanelHeader title="Revenue & sales" subtitle={`${r.range.label} · revenue counts approved payments only`} />
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Report period" className="flex flex-wrap gap-2">
            {RANGES.map((range) => (
              <Link
                key={range.value}
                href={`/admin/reports?range=${range.value}`}
                aria-current={range.value === r.range.value ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition ${range.value === r.range.value ? "border-accent bg-[#4B1E0E] text-white" : "border-[#302C2A] text-white/60 hover:border-white/30 hover:text-white"}`}
              >
                {range.label}
              </Link>
            ))}
          </nav>
          <span className="ml-auto">{exportLink}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
          <StatCard icon={Wallet} label="Revenue" value={formatPrice(r.totals.revenue)} hint={`${r.totals.orders} paid orders`} />
          <StatCard icon={Receipt} label="Average order" value={formatPrice(r.totals.average)} hint={r.totals.approvalRate == null ? "No reviewed orders" : `${r.totals.approvalRate}% of reviewed payments approved`} />
          <StatCard icon={Users} label="Paying students" value={r.totals.students} hint={`${r.totals.pending} payments waiting`} />
          <StatCard icon={RotateCcw} label="Refunded" value={formatPrice(r.totals.refunded)} hint={`${r.totals.refunds} refunds`} />
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <PanelCard title="Revenue over time">
            {r.revenue.length ? <BarChart label={`Revenue per ${r.range.unit}`} data={r.revenue.slice(-16)} format={compact} /> : <EmptyState text="No approved payments in this period." />}
          </PanelCard>
          <PanelCard title="New students">
            {r.signups.length ? <BarChart label={`New students per ${r.range.unit}`} data={r.signups.slice(-16)} /> : <EmptyState text="No new sign-ups in this period." />}
          </PanelCard>
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <PanelCard title="Revenue by course">
            <ReportCourseTable rows={r.byCourse} />
          </PanelCard>
          <PanelCard title="By payment method">
            {r.byMethod.length ? (
              <ul className="flex flex-col gap-4">
                {r.byMethod.map((m) => (
                  <li key={m.method} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span>{m.method}</span>
                      <span className="text-white/60">
                        {formatPrice(m.revenue)} · {m.orders}
                      </span>
                    </div>
                    <ProgressBar percent={m.share} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState text="No approved payments in this period." />
            )}
          </PanelCard>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;
