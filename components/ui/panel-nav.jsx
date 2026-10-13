"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Settings, X } from "lucide-react";
import SignOutButton from "@/features/auth/components/sign-out-button";

const navs = {
  student: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
  ],
};

const PanelNav = ({ panel, title }) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = navs[panel];
  const root = items[0].href;

  const isActive = (href) => (href === root ? pathname === root : pathname.startsWith(href));
  const handleToggle = () => setOpen((v) => !v);
  const handleClose = () => setOpen(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 lg:hidden">
        <span className="font-machina text-xl">{title}</span>
        <button type="button" onClick={handleToggle} aria-label="Toggle navigation" aria-expanded={open} className="rounded-lg p-2 hover:bg-white/5">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      <aside
        className={`${open ? "flex" : "hidden"} flex-col gap-1 border-white/10 bg-[#070707] p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:border-r lg:p-6`}
      >
        <Link href="/" className="mb-6 hidden font-machina text-2xl lg:block">
          {title}
        </Link>
        <nav className="flex flex-col gap-1">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={handleClose}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition ${isActive(href) ? "bg-[#4B1E0E] text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
        <SignOutButton className="mt-auto" />
      </aside>
    </>
  );
};

export default PanelNav;
