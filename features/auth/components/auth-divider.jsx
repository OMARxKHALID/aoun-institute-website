import GoogleButton from "@/features/auth/components/google-button";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const AuthDivider = () => {
  if (!googleEnabled) return null;
  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center gap-4 text-sm text-white/50">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <GoogleButton />
    </div>
  );
};

export default AuthDivider;
