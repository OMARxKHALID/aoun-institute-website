"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { railLabel } from "@/lib/ui";

const SignOutButton = ({ compact, className = "" }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
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
