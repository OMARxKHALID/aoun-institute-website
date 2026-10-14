"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { requestAccountDeletion, updateAvatar, updateNotifications, updateProfile } from "@/features/profile/actions";
import { NOTIFICATIONS, notificationsSchema, passwordSchema, profileSchema } from "@/features/profile/schemas";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import FormAlert from "@/components/ui/form-alert";
import ImageUpload from "@/components/ui/image-upload";
import PanelCard from "@/components/ui/panel-card";
import TabList from "@/components/ui/tab-list";
import { useDialog } from "@/components/ui/dialog-provider";

const applyErrors = (result, setError) => Object.entries(result.errors).forEach(([field, messages]) => setError(field, { message: messages[0] }));

const ProfileForm = ({ profile }) => {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name, phone: profile.phone, bio: profile.bio, country: profile.country, city: profile.city, birthDate: profile.birthDate },
  });
  const { errors, isSubmitting } = formState;

  const handleSave = async (values) => {
    setSaved(false);
    const result = await updateProfile(values);
    if (!result.ok) return applyErrors(result, setError);
    setSaved(true);
    router.refresh();
  };

  const handleAvatar = async (value) => {
    setAvatarError(null);
    const result = await updateAvatar(value ? { publicId: value.publicId } : null);
    if (!result.ok) return setAvatarError(Object.values(result.errors).flat()[0]);
    router.refresh();
  };

  return (
    <PanelCard title="Profile">
      <div className="flex flex-col gap-2">
        <ImageUpload kind="avatar" label="Profile photo (square, JPG/PNG/WEBP, max 2 MB)" value={profile.image ? { url: profile.image } : null} onChange={handleAvatar} aspect={1} />
        <FormAlert>{avatarError}</FormAlert>
      </div>
      <form onSubmit={handleSubmit(handleSave)} noValidate className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormAlert>{errors.root?.message}</FormAlert>
          {saved && <FormAlert type="success">Profile saved.</FormAlert>}
        </div>
        <Field label="Full name (shown on certificates)" error={errors.name?.message} {...register("name")} />
        <Field label="Email" value={profile.email} readOnly disabled name="email-readonly" />
        <Field label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
        <Field label="Date of birth" type="date" error={errors.birthDate?.message} {...register("birthDate")} />
        <Field label="Country" autoComplete="country-name" error={errors.country?.message} {...register("country")} />
        <Field label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
        <Field label="Short bio" rows={3} className="md:col-span-2" error={errors.bio?.message} {...register("bio")} />
        <Button type="submit" loading={isSubmitting} className="self-start md:col-span-2 md:justify-self-start">
          Save Profile
        </Button>
      </form>
    </PanelCard>
  );
};

const PasswordForm = ({ hasPassword }) => {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, setError, reset, formState } = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  const { errors, isSubmitting } = formState;

  const handleSave = async ({ currentPassword, newPassword }) => {
    setSaved(false);
    const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    if (error) return setError(error.code === "INVALID_PASSWORD" ? "currentPassword" : "root", { message: error.message ?? "Could not change password" });
    reset();
    setSaved(true);
  };

  if (!hasPassword)
    return (
      <PanelCard title="Password">
        <p className="text-sm text-white/55">You sign in with Google. Use “Forgot password” on the login page to add a password.</p>
      </PanelCard>
    );

  return (
    <PanelCard title="Change password">
      <form onSubmit={handleSubmit(handleSave)} noValidate className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormAlert>{errors.root?.message}</FormAlert>
          {saved && <FormAlert type="success">Password changed. Other devices were signed out.</FormAlert>}
        </div>
        <Field label="Current password" type="password" autoComplete="current-password" className="md:col-span-2" error={errors.currentPassword?.message} {...register("currentPassword")} />
        <Field label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword")} />
        <Field label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" loading={isSubmitting} className="self-start md:col-span-2 md:justify-self-start">
          Change Password
        </Button>
      </form>
    </PanelCard>
  );
};

const NotificationsForm = ({ profile }) => {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(notificationsSchema),
    defaultValues: Object.fromEntries(NOTIFICATIONS.map((n) => [n.name, profile[n.name]])),
  });

  const handleSave = async (values) => {
    setSaved(false);
    const result = await updateNotifications(values);
    if (result.ok) setSaved(true);
  };

  return (
    <PanelCard title="Email notifications">
      <form onSubmit={handleSubmit(handleSave)} className="grid gap-3 md:grid-cols-2">
        {saved && (
          <div className="md:col-span-2">
            <FormAlert type="success">Preferences saved.</FormAlert>
          </div>
        )}
        {NOTIFICATIONS.map((n) => (
          <Checkbox key={n.name} label={n.label} hint={n.hint} {...register(n.name)} />
        ))}
        <Button type="submit" loading={formState.isSubmitting} className="self-start md:col-span-2 md:justify-self-start">
          Save Preferences
        </Button>
      </form>
    </PanelCard>
  );
};

const DangerZone = ({ requested }) => {
  const dialog = useDialog();
  const [done, setDone] = useState(Boolean(requested));

  const handleRequest = async () => {
    if (!(await dialog.confirm({ title: "Delete your account?", message: "The institute will delete your account and data. Your certificates stay verifiable. This cannot be undone once processed.", confirmLabel: "Request deletion", danger: true }))) return;
    const result = await requestAccountDeletion();
    if (result.ok) setDone(true);
  };

  return (
    <PanelCard title="Delete account">
      {done ? (
        <p className="text-sm text-amber-200">Deletion requested. The institute will contact you by email to confirm.</p>
      ) : (
        <>
          <p className="text-sm text-white/55">Your certificates stay verifiable, but your progress and profile will be removed.</p>
          <Button type="button" variant="danger" onClick={handleRequest} className="self-start">
            Request Deletion
          </Button>
        </>
      )}
    </PanelCard>
  );
};

const tabs = ["Profile", "Security", "Notifications"];

const SettingsForms = ({ profile }) => {
  const [tab, setTab] = useState(tabs[0]);
  return (
    <div className="flex flex-col gap-5">
      <TabList tabs={tabs} value={tab} onChange={setTab} label="Settings" />
      <div hidden={tab !== "Profile"}>
        <ProfileForm profile={profile} />
      </div>
      <div hidden={tab !== "Security"} className="flex flex-col gap-5">
        <PasswordForm hasPassword={profile.hasPassword} />
        <DangerZone requested={profile.deletionRequestedAt} />
      </div>
      <div hidden={tab !== "Notifications"}>
        <NotificationsForm profile={profile} />
      </div>
    </div>
  );
};

export default SettingsForms;
