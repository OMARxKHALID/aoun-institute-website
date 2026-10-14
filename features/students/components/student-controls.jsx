"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Trash2, Undo2, UserPlus } from "lucide-react";
import { banStudent, deleteStudent, enrollStudent, revokeEnrollment, unbanStudent } from "@/features/students/actions";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import Select from "@/components/ui/select";

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
  const router = useRouter();
  const { run, error, busy } = useRun();

  const handleBan = () => {
    const reason = window.prompt("Why are you blocking this student? They will be signed out.");
    if (reason) run(() => banStudent(student.id, { reason }));
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently delete ${student.name}'s account, progress and quiz attempts? Orders and certificates are kept. This cannot be undone.`))
      run(() => deleteStudent(student.id), () => router.push("/admin/students"));
  };

  return (
    <div className="flex flex-col gap-3">
      <FormAlert>{error}</FormAlert>
      <div className="flex flex-wrap gap-2">
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
          className="rounded-xl border border-[#302C2A] bg-[#0C0C0C] px-4 py-2.5 outline-hidden focus:border-accent"
        />
        <Button type="button" loading={busy} disabled={!courseId} onClick={() => run(() => enrollStudent(studentId, courseId))}>
          <UserPlus className="size-4" /> Enroll free
        </Button>
      </div>
    </div>
  );
};

export const RevokeEnrollmentButton = ({ studentId, courseId, course }) => {
  const { run, error, busy } = useRun();
  const handleClick = () => {
    if (window.confirm(`Remove access to ${course}? Progress is kept if you enroll them again.`)) run(() => revokeEnrollment(studentId, courseId));
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
