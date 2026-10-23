"use client";

import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import ActionMenu from "@/components/ui/action-menu";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";

const links = {
  owner: [
    { label: "Overview", icon: LayoutDashboard, href: "/admin" },
    { label: "Site settings", icon: Settings, href: "/admin/settings" },
  ],
  teacher: [
    { label: "My courses", icon: LayoutDashboard, href: "/admin/courses" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  student: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
};

const AccountMenu = ({ role = "student", children }) => {
  const { signOut, loading } = useSignOut();

  return (
    <ActionMenu
      label="Your account"
      trigger={children}
      triggerClassName="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-accent/60 bg-linear-to-br from-accent to-[#4B1E0E] font-semibold transition hover:border-accent"
      items={[
        ...links[role],
        { label: "Sign out", icon: LogOut, danger: true, disabled: loading, onClick: signOut },
      ]}
    />
  );
};

export default AccountMenu;
