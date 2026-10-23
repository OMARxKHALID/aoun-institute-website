"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import PanelCard from "@/components/ui/panel-card";
import { useDialog } from "@/components/ui/dialog-provider";
import { inputClass, labelClass } from "@/lib/ui";

const askPassword = (dialog, title) => dialog.prompt({ title, message: "Enter your password to continue.", label: "Password", multiline: false, inputType: "password", minLength: 1, confirmLabel: "Continue" });

const TwoFactorCard = ({ enabled, hasPassword }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleEnable = async () => {
    const password = await askPassword(dialog, "Turn on two-factor sign-in");
    if (!password) return;
    setBusy(true);
    const { data, error: failure } = await authClient.twoFactor.enable({ password });
    setBusy(false);
    if (failure) return setError(failure.message ?? "Could not start setup");
    setError(null);
    setSetup({ qr: await QRCode.toDataURL(data.totpURI, { margin: 1, width: 220 }), backupCodes: data.backupCodes ?? [] });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error: failure } = await authClient.twoFactor.verifyTotp({ code: code.trim() });
    setBusy(false);
    if (failure) return setError(failure.message ?? "That code did not match. Try the newest one.");
    setSetup(null);
    setCode("");
    setError(null);
    router.refresh();
  };

  const handleDisable = async () => {
    const password = await askPassword(dialog, "Turn off two-factor sign-in");
    if (!password) return;
    setBusy(true);
    const { error: failure } = await authClient.twoFactor.disable({ password });
    setBusy(false);
    if (failure) return setError(failure.message ?? "Could not turn it off");
    setError(null);
    router.refresh();
  };

  return (
    <PanelCard title="Two-factor sign-in">
      <p className="text-sm text-white/70">After your password, sign-in also asks for a 6-digit code from an authenticator app such as Google Authenticator or 1Password.</p>
      <FormAlert>{error}</FormAlert>
      {setup ? (
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <img src={setup.qr} alt="QR code for your authenticator app" className="size-44 shrink-0 rounded-xl bg-white p-2" />
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-white/70">1. Scan this code with your authenticator app.</p>
              <p className="text-white/70">2. Save these backup codes somewhere safe. Each works once if you lose your phone.</p>
              <ul className="grid grid-cols-2 gap-1 font-mono text-white">
                {setup.backupCodes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <label htmlFor="totp-confirm" className={labelClass}>
            3. Enter the 6-digit code from the app
          </label>
          <div className="flex gap-2">
            <input id="totp-confirm" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" className={`${inputClass} max-w-40 font-mono`} />
            <Button type="submit" loading={busy} disabled={code.length !== 6}>
              Turn on
            </Button>
          </div>
        </form>
      ) : enabled ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex items-center gap-2 text-sm text-green-400">
            <ShieldCheck className="size-4" /> On
          </p>
          <Button type="button" variant="outline" loading={busy} onClick={handleDisable}>
            Turn off
          </Button>
        </div>
      ) : hasPassword ? (
        <Button type="button" loading={busy} onClick={handleEnable} className="self-start">
          Turn on two-factor sign-in
        </Button>
      ) : (
        <p className="text-sm text-white/50">Set a password first to use two-factor sign-in.</p>
      )}
    </PanelCard>
  );
};

export default TwoFactorCard;
