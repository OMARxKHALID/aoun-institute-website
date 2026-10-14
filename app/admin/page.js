import Link from "next/link";
import { ArrowUpRight, BookOpen, Receipt, Settings } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import PanelHeader from "@/components/ui/panel-header";

const shortcuts = [
  { title: "Courses", text: "Create courses, build the syllabus, manage lessons", href: "/admin/courses", icon: BookOpen },
  { title: "Orders", text: "Review payments and enroll students", href: "/admin/orders", icon: Receipt },
  { title: "Site Settings", text: "Brand, contact, homepage content, SEO, payment details", href: "/admin/settings", icon: Settings },
];

const AdminPage = async () => {
  const user = await requireAdmin();
  return (
    <>
      <PanelHeader title={`Welcome back, ${user.name.split(" ")[0]} 👋`} subtitle="Manage your institute from one place." />
      <div className="grid gap-5 p-5 sm:grid-cols-2 lg:p-8 xl:grid-cols-3">
        {shortcuts.map(({ title, text, href, icon: Icon }) => (
          <Link key={href} href={href} className="group relative flex flex-col gap-4 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-6 transition hover:border-accent">
            <ArrowUpRight className="absolute right-5 top-5 size-5 text-white/40 transition group-hover:rotate-45 group-hover:text-accent" />
            <span className="grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-xl font-medium">{title}</p>
              <p className="mt-1 text-white/55">{text}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default AdminPage;
