"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, KeyRound, Trash2, Undo2, UserPlus } from "lucide-react";
import { banStudent, deleteStudent, enrollStudent, revokeEnrollment, setStudentPassword, unbanStudent } from "@/features/students/actions";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import Select from "@/components/ui/select";
import { useDialog } from "@/components/ui/dialog-provider";
import { inputClass } from "@/lib/ui";

const firstError = (result) => Object.values(result.errors ?? {}).flat()[0];

const useRun = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async (action, after) => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) return setError(firstError(result));
    if (after) return after();
    router.refresh();
  };
  return { run, error, busy };
};

export const AccountControls = ({ student }) => {
  const dialog = useDialog();
  const router = useRouter();
  const { run, error, busy } = useRun();

  const handleBan = async () => {
    const reason = await dialog.prompt({ title: `Block ${student.name}?`, message: "They are signed out everywhere and cannot sign in until you unblock them.", label: "Reason (only admins see this)", placeholder: "e.g. Sharing their account", minLength: 3, danger: true, confirmLabel: "Block student" });
    if (reason) run(() => banStudent(student.id, { reason }));
  };

  const [notice, setNotice] = useState(null);

  const handlePassword = async () => {
    const password = await dialog.prompt({ title: `New password for ${student.name}`, message: "They are signed out on every device and get an email saying their password changed. Share the new password with them yourself.", label: "New password", placeholder: "At least 8 characters", multiline: false, inputType: "password", minLength: 8, maxLength: 128, confirmLabel: "Set password" });
    if (password) run(() => setStudentPassword(student.id, { password }), () => setNotice("Password changed. The student was signed out."));
  };

  const handleDelete = async () => {
    if ((await dialog.confirm({ title: `Delete ${student.name}'s account?`, message: "Their progress, notes and quiz attempts are deleted. Orders and certificates are kept for your records. This cannot be undone.", confirmLabel: "Delete account", danger: true })))
      run(() => deleteStudent(student.id), () => router.push("/admin/students"));
  };

  return (
    <div className="flex flex-col gap-3">
      <FormAlert>{error}</FormAlert>
      {notice && <p className="text-sm text-green-300">{notice}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" loading={busy} onClick={handlePassword}>
          <KeyRound className="size-4" /> Change password
        </Button>
        {student.banned ? (
          <Button type="button" variant="outline" loading={busy} onClick={() => run(() => unbanStudent(student.id))}>
            <Undo2 className="size-4" /> Unblock
          </Button>
        ) : (
          <Button type="button" variant="outline" loading={busy} onClick={handleBan}>
            <Ban className="size-4" /> Block
          </Button>
        )}
        <Button type="button" variant="danger" loading={busy} onClick={handleDelete}>
          <Trash2 className="size-4" /> Delete
        </Button>
      </div>
    </div>
  );
};

export const EnrollControl = ({ studentId, courses }) => {
  const { run, error, busy } = useRun();
  const [courseId, setCourseId] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <FormAlert>{error}</FormAlert>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Choose a course"
          options={courses}
          aria-label="Course to enroll in"
          wrapperClassName="flex-1"
          className={inputClass}
        />
        <Button type="button" loading={busy} disabled={!courseId} onClick={() => run(() => enrollStudent(studentId, courseId))}>
          <UserPlus className="size-4" /> Enroll free
        </Button>
      </div>
    </div>
  );
};

export const RevokeEnrollmentButton = ({ studentId, courseId, course }) => {
  const dialog = useDialog();
  const { run, error, busy } = useRun();
  const handleClick = async () => {
    if ((await dialog.confirm({ title: `Remove access to ${course}?`, message: "Their progress is kept if you enroll them again later.", confirmLabel: "Remove access", danger: true }))) run(() => revokeEnrollment(studentId, courseId));
  };
  return (
    <span className="flex flex-col items-end gap-1">
      <button type="button" onClick={handleClick} disabled={busy} className="rounded-full px-3 py-1 text-sm text-red-300/80 hover:bg-red-500/10 disabled:opacity-50">
        Remove access
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </span>
  );
};
