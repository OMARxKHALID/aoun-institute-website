import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { getUser, isAdmin } from "@/lib/dal";

const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const PanelHeader = async ({ title, subtitle, back, children }) => {
  const user = await getUser();
  const admin = isAdmin(user);
  return (
    <header className="flex flex-col gap-4 border-b border-white/5 p-5 md:flex-row md:items-center md:justify-between lg:p-8">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1.5 text-sm text-white/50 transition hover:text-accent">
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
        )}
        <h1 className="truncate font-machina text-3xl md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-white/50">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <form action={admin ? "/admin/courses" : "/courses"} className="relative flex-1 md:w-72 md:flex-none">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            name="q"
            type="search"
            placeholder="Search courses"
            aria-label="Search courses"
            className="w-full rounded-full border border-[#302C2A] bg-[#0C0C0C] py-2.5 pl-11 pr-4 text-base outline-hidden placeholder:text-white/30 focus:border-accent"
          />
        </form>
        <Link
          href={admin ? "/admin" : "/dashboard/settings"}
          aria-label="Your account"
          className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent/60 bg-linear-to-br from-accent to-[#4B1E0E] font-semibold"
        >
          {user?.image ? <img src={user.image} alt="" className="size-full object-cover" /> : initials(user?.name)}
        </Link>
      </div>
    </header>
  );
};

export default PanelHeader;
