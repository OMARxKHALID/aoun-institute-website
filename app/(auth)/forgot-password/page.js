import Link from "next/link";
import AuthShell from "@/components/ui/auth-shell";
import ForgotPasswordForm from "@/features/auth/components/forgot-password-form";

export const metadata = { title: "Forgot Password" };

const ForgotPasswordPage = () => (
  <AuthShell tag="Password" title="Forgot your password?" text="Enter your email and we will send you a reset link.">
    <ForgotPasswordForm />
    <p className="mt-6 text-white/70">
      Remembered it?{" "}
      <Link href="/login" className="text-accent hover:underline">
        Back to sign in
      </Link>
    </p>
  </AuthShell>
);

export default ForgotPasswordPage;
