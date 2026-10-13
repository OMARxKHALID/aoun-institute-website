"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-white/70 transition hover:bg-white/5 hover:text-white ${compact ? "lg:justify-center lg:px-0" : ""} ${className}`}
    >
      <LogOut className="size-5 shrink-0" />
      <span className={compact ? "lg:hidden" : ""}>Sign out</span>
    </button>
  );
};

export default SignOutButton;
