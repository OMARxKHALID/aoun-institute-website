"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen, Settings, X } from "lucide-react";
import SignOutButton from "@/features/auth/components/sign-out-button";

const navs = {
  student: {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    promo: { title: "Keep learning", text: "Explore new courses and level up your skills.", href: "/courses", cta: "Browse courses" },
  },
  admin: {
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
    ],
    promo: { title: "Your website", text: "See the public site the way students see it.", href: "/", cta: "View site" },
  },
};

const STORAGE_KEY = "panel-sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeCollapsed = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {}
};

const PanelNav = ({ panel, brand }) => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { items, promo } = navs[panel];
  const root = items[0].href;

  useEffect(() => {
    setCollapsed(readCollapsed());
  }, []);

  const isActive = (href) => (href === root ? pathname === root : pathname.startsWith(href));
  const handleToggle = () => setOpen((v) => !v);
  const handleClose = () => setOpen(false);
  const handleCollapse = () =>
    setCollapsed((v) => {
      writeCollapsed(!v);
      return !v;
    });

  const hideWhenCollapsed = collapsed ? "lg:hidden" : "";

  return (
    <div className={`transition-[width] duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:shrink-0 ${collapsed ? "lg:w-20" : "lg:w-72"}`}>
      <div className="flex items-center justify-between rounded-2xl bg-[#0C0C0C] px-5 py-4 lg:hidden">
        <Link href={root} className="font-machina text-xl">
          {brand.name}
        </Link>
        <button type="button" onClick={handleToggle} aria-label="Toggle navigation" aria-expanded={open} className="rounded-lg p-2 hover:bg-white/5">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <aside
        className={`${open ? "flex" : "hidden"} mt-2 flex-col gap-6 rounded-3xl border border-white/5 bg-[#0C0C0C] p-5 lg:mt-0 lg:flex lg:h-full ${collapsed ? "lg:items-center lg:px-3 lg:py-6" : "lg:p-6"}`}
      >
        <div className="hidden w-full items-center gap-3 lg:flex">
          <Link href="/" aria-label={brand.name} className={`flex min-w-0 items-center gap-3 ${collapsed ? "lg:hidden" : ""}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white font-machina text-xl font-bold text-black">{brand.name?.[0]}</span>
            <span className="truncate font-machina text-2xl leading-none">{brand.shortName || brand.name}</span>
          </Link>
          {panel === "admin" && !collapsed && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs uppercase tracking-wider text-accent">Admin</span>}
          <button
            type="button"
            onClick={handleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`grid size-10 shrink-0 place-items-center rounded-xl text-white/60 transition hover:bg-white/5 hover:text-white ${collapsed ? "mx-auto" : "ml-auto"}`}
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
        </div>

        <nav className="flex w-full flex-col gap-1.5">
          {items.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={handleClose}
                title={collapsed ? label : undefined}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full py-3 transition ${collapsed ? "px-5 lg:justify-center lg:px-0" : "px-5"} ${
                  active ? "bg-linear-to-b from-[#E8602E] to-[#A8401A] font-medium text-white shadow-[0_0_24px_rgba(232,96,46,0.35)]" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span className={hideWhenCollapsed}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex w-full flex-col gap-3">
          <Link href={promo.href} onClick={handleClose} className={`group relative overflow-hidden rounded-2xl bg-[#FFF3EF] p-5 text-black ${hideWhenCollapsed}`}>
            <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black text-white transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
            <p className="font-machina text-xl">{promo.title}</p>
            <p className="mt-1 pr-8 text-sm text-black/60">{promo.text}</p>
            <span className="mt-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white">{promo.cta}</span>
          </Link>
          <SignOutButton compact={collapsed} />
        </div>
      </aside>
    </div>
  );
};

export default PanelNav;
