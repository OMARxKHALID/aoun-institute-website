import Link from "next/link";
import AuthShell from "@/components/ui/auth-shell";

export const metadata = { title: "Verify Email" };

const VerifyEmailPage = () => (
  <AuthShell tag="Verify" title="Check your inbox" text="We sent you a verification link. Open it on this device to activate your account.">
    <p className="text-white/60">
      Link expired or never arrived? Sign in and we will offer to resend it.{" "}
      <Link href="/login" className="text-accent hover:underline">
        Go to sign in
      </Link>
    </p>
  </AuthShell>
);

export default VerifyEmailPage;
