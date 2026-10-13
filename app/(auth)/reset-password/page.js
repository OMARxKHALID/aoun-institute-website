import { Suspense } from "react";
import AuthShell from "@/components/ui/auth-shell";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";

export const metadata = { title: "Reset Password" };

const ResetPasswordPage = () => (
  <AuthShell tag="Password" title="Choose a new password" text="Use at least 8 characters.">
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  </AuthShell>
);

export default ResetPasswordPage;
