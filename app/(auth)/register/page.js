import Link from "next/link";
import AuthShell from "@/components/ui/auth-shell";
import RegisterForm from "@/features/auth/components/register-form";
import AuthDivider from "@/features/auth/components/auth-divider";

export const metadata = { title: "Create Account" };

const RegisterPage = () => (
  <AuthShell tag="Register" title="Start your journey" text="Create an account to buy courses, track progress, and earn certificates.">
    <RegisterForm />
    <AuthDivider />
    <p className="mt-6 text-white/70">
      Already have an account?{" "}
      <Link href="/login" className="text-accent hover:underline">
        Sign in
      </Link>
    </p>
  </AuthShell>
);

export default RegisterPage;
