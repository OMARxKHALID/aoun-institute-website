import { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/ui/auth-shell";
import LoginForm from "@/features/auth/components/login-form";
import AuthDivider from "@/features/auth/components/auth-divider";

export const metadata = { title: "Sign In" };

const LoginPage = () => (
  <AuthShell tag="Sign In" title="Welcome back" text="Pick up right where you left off.">
    <Suspense>
      <LoginForm />
    </Suspense>
    <AuthDivider />
    <p className="mt-6 text-white/60">
      New here?{" "}
      <Link href="/register" className="text-accent hover:underline">
        Create an account
      </Link>
    </p>
  </AuthShell>
);

export default LoginPage;
