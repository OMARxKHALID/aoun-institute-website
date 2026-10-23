import Link from "next/link";
import Form from "next/form";
import { ArrowLeft, Search } from "lucide-react";
import { getUser, isAdmin, isTeacher } from "@/lib/dal";
import { imageUrl } from "@/lib/upload-rules";
import AccountMenu from "@/features/auth/components/account-menu";
import { searchClass } from "@/lib/ui";

const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const PanelHeader = async ({ title, subtitle, back, query = "", children }) => {
  const user = await getUser();
  const admin = isAdmin(user);
  const role = admin ? "owner" : isTeacher(user) ? "teacher" : "student";
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
        {role !== "teacher" && (
          <Form action={admin ? "/admin/search" : "/dashboard/search"} role="search" className="relative flex-1 md:w-72 md:flex-none">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/50" />
            <input
              key={query}
              name="q"
              required
              minLength={2}
              type="search"
              defaultValue={query}
              placeholder={admin ? "Search courses, students, orders…" : "Search courses, lessons, notes…"}
              aria-label="Search"
              className={searchClass}
            />
          </Form>
        )}
        <AccountMenu role={role}>{user?.image ? <img src={imageUrl(user.image, 96)} alt="" className="size-full object-cover" /> : initials(user?.name)}</AccountMenu>
      </div>
    </header>
  );
};

export default PanelHeader;
