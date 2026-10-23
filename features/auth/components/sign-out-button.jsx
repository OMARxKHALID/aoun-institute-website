"use client";

import { LogOut } from "lucide-react";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { railLabel } from "@/lib/ui";

const SignOutButton = ({ compact, className = "" }) => {
  const { signOut, loading } = useSignOut();

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      aria-label="Sign out"
      title={compact ? "Sign out" : undefined}
      className={`flex items-center rounded-full px-[17px] py-2.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white ${className}`}
    >
      <LogOut className="size-5 shrink-0" />
      <span className={railLabel(compact)}>Sign out</span>
    </button>
  );
};

export default SignOutButton;
