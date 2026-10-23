import Link from "next/link";
import { Award, BookOpen, ChevronRight, Clock, Receipt, Users, Wallet } from "lucide-react";
import { getAdminDashboard } from "@/features/analytics/queries";
import PanelHeader from "@/components/ui/panel-header";
import PanelCard from "@/components/ui/panel-card";
import StatCard from "@/components/ui/stat-card";
import BarChart from "@/components/ui/bar-chart";
import MiniCalendar from "@/components/ui/mini-calendar";
import StatusPill from "@/components/ui/status-pill";
import { formatDate, formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/upload-rules";

const compact = (value) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const SeeAll = ({ href }) => (
  <Link href={href} className="flex shrink-0 items-center gap-1 text-sm text-white/50 hover:text-accent">
    See all <ChevronRight className="size-4" />
  </Link>
);

const AdminPage = async () => {
  const data = await getAdminDashboard();
  const { stats } = data;
  return (
    <>
      <PanelHeader title={`Welcome back, ${data.admin.name.split(" ")[0]} 👋`} subtitle="Here is how your institute is doing." />
      <div className="grid gap-5 p-4 sm:p-5 lg:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 2xl:grid-cols-4">
            <StatCard icon={Wallet} label="Total revenue" value={formatPrice(stats.revenue)} hint={`${stats.paidOrders} paid orders`} />
            <StatCard icon={Users} label="Students" value={stats.students} hint={`${stats.activeEnrollments} active enrollments`} />
            <StatCard icon={Clock} label="Payments to review" value={stats.pending} />
            <StatCard icon={Award} label="Certificates issued" value={stats.certificates} />
          </div>

          <PanelCard title="Top courses" action={<SeeAll href="/admin/courses" />}>
            {data.topCourses.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {data.topCourses.map((c) => (
                  <Link key={c.id} href={`/admin/courses/${c.id}`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-4 transition hover:border-accent/50">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent/15 text-accent">
                      {c.thumbnail?.url ? <img src={imageUrl(c.thumbnail.url, 160)} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <BookOpen className="size-5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{c.title}</span>
                      <span className="block truncate text-xs text-white/50">
                        {c.students} {c.students === 1 ? "student" : "students"}
                        {c.category && ` · ${c.category}`}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50">No enrollments yet.</p>
            )}
          </PanelCard>

          <div className="grid min-w-0 gap-5 lg:grid-cols-2">
            <PanelCard
              title="Revenue"
              action={
                <span className="text-sm text-white/50">
                  {formatPrice(stats.thisMonth)} this month
                  {stats.change != null && <span className={stats.change >= 0 ? "text-green-400" : "text-red-400"}> {stats.change >= 0 ? `+${stats.change}` : stats.change}%</span>}
                </span>
              }
            >
              <BarChart label="Revenue for the last six months" data={data.months} format={compact} />
            </PanelCard>
            <PanelCard title="Payments to review" action={<SeeAll href="/admin/orders" />}>
              {data.pending.length ? (
                <ul className="flex flex-col gap-2">
                  {data.pending.map((o) => (
                    <li key={o.id}>
                      <Link href="/admin/orders" className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-3 transition hover:border-accent/50">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-300">
                          <Receipt className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{o.student}</span>
                          <span className="block truncate text-xs text-white/50">
                            {o.course} · {formatPrice(o.amount, o.currency)}
                          </span>
                        </span>
                        <ChevronRight className="size-4 text-white/50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/50">Nothing waiting. Nice.</p>
              )}
            </PanelCard>
          </div>

          <PanelCard title="Recent orders" action={<SeeAll href="/admin/orders" />}>
            {data.recentOrders.length ? (
              <ul className="flex flex-col divide-y divide-white/5">
                {data.recentOrders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
                    <span className="min-w-0 flex-1 basis-40">
                      <span className="block truncate font-medium">{o.student}</span>
                      <span className="block truncate text-xs text-white/50">{o.course}</span>
                    </span>
                    <span>{formatPrice(o.amount, o.currency)}</span>
                    <span className="text-white/50">{formatDate(o.createdAt)}</span>
                    <StatusPill status={o.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/50">No orders yet.</p>
            )}
          </PanelCard>
        </div>

        <aside className="grid min-w-0 content-start gap-5 md:grid-cols-2 xl:grid-cols-1">
          <PanelCard>
            <MiniCalendar marked={data.salesDays} />
            <p className="text-xs text-white/50">Highlighted days had approved payments.</p>
          </PanelCard>
          <PanelCard title="Shortcuts">
            <ul className="flex flex-col gap-2 text-sm">
              {[
                ["/admin/courses/new", "Create a course"],
                ["/admin/announcements", "Post an announcement"],
                ["/admin/certificates", "Issue a certificate"],
                ["/admin/settings", "Edit site settings"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#070707] px-3 py-2.5 hover:border-accent/50">
                    {label} <ChevronRight className="size-4 text-white/50" />
                  </Link>
                </li>
              ))}
            </ul>
          </PanelCard>
        </aside>
      </div>
    </>
  );
};

export default AdminPage;
