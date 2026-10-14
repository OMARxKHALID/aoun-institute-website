"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createColumnHelper } from "@tanstack/react-table";
import { Ban, Download, ExternalLink, RefreshCw } from "lucide-react";
import { issueCertificateManually, reissueCertificate, revokeCertificate } from "@/features/certificates/actions";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import PanelCard from "@/components/ui/panel-card";
import StatusPill from "@/components/ui/status-pill";
import { formatDate } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";

const helper = createColumnHelper();

const firstError = (result) => Object.values(result.errors ?? {}).flat()[0];

const IssueForm = ({ courses, onDone }) => {
  const { register, handleSubmit, setError, reset, formState } = useForm({ defaultValues: { email: "", courseId: "" } });
  const { errors, isSubmitting } = formState;

  const handleIssue = async (values) => {
    const result = await issueCertificateManually(values);
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setError(field, { message: messages[0] }));
    reset();
    onDone(`Certificate ${result.data.code} issued.`);
  };

  return (
    <PanelCard title="Issue a certificate manually">
      <form onSubmit={handleSubmit(handleIssue)} noValidate className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <FormAlert>{errors.root?.message}</FormAlert>
        <Field label="Student email" type="email" error={errors.email?.message} {...register("email")} />
        <Field label="Course" options={courses} error={errors.courseId?.message} {...register("courseId")} />
        <Button type="submit" loading={isSubmitting}>
          Issue
        </Button>
      </form>
    </PanelCard>
  );
};

const CertificateTable = ({ certificates, courses }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const run = async (action, success) => {
    setError(null);
    setMessage(null);
    const result = await action();
    if (!result.ok) return setError(firstError(result));
    setMessage(typeof success === "function" ? success(result) : success);
    router.refresh();
  };

  const handleRevoke = async (c) => {
    const reason = await dialog.prompt({ title: `Revoke ${c.code}?`, message: `${c.studentName} · ${c.courseTitle}. The public verify page will show it as revoked with this reason.`, label: "Reason", placeholder: "e.g. Issued by mistake", minLength: 3, danger: true, confirmLabel: "Revoke" });
    if (reason) run(() => revokeCertificate(c.id, { reason }), `${c.code} revoked.`);
  };

  const handleReissue = async (c) => {
    if ((await dialog.confirm({ title: `Reissue ${c.code}?`, message: "The old ID is revoked and the student gets a new certificate with a new ID by email.", confirmLabel: "Reissue", danger: false }))) run(() => reissueCertificate(c.id), (r) => `New certificate ${r.data.code} issued.`);
  };

  const handleIssued = (text) => {
    setError(null);
    setMessage(text);
    router.refresh();
  };

  const columns = helper.columns([
    helper.accessor("studentName", {
      header: "Student",
      cell: ({ row }) => (
        <span>
          <span className="block font-medium">{row.original.studentName}</span>
          <span className="block text-sm text-white/45">{row.original.email}</span>
        </span>
      ),
    }),
    helper.accessor("courseTitle", { header: "Course" }),
    helper.accessor("code", { header: "Certificate ID", cell: ({ getValue }) => <span className="select-all font-mono text-sm">{getValue()}</span> }),
    helper.accessor("issuedAt", { header: "Issued", sortingFn: "datetime", cell: ({ getValue }) => <span className="text-white/60">{formatDate(getValue())}</span> }),
    helper.accessor("status", {
      header: "Status",
      cell: ({ row }) => (
        <span className="flex flex-col items-start gap-1">
          <StatusPill status={row.original.status} />
          {row.original.reason && <span className="text-xs text-white/40">{row.original.reason}</span>}
        </span>
      ),
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <ActionMenu
            label={`Actions for ${c.code}`}
            items={[
              { label: "Open verify page", icon: ExternalLink, href: `/verify/${c.code}`, external: true },
              { label: "Download PDF", icon: Download, href: `/api/certificates/${c.code}/pdf`, external: true },
              c.status === "VALID" && { label: "Reissue with new ID", icon: RefreshCw, onClick: () => handleReissue(c) },
              c.status === "VALID" && { label: "Revoke", icon: Ban, danger: true, onClick: () => handleRevoke(c) },
            ]}
          />
        );
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <IssueForm courses={courses} onDone={handleIssued} />
      <FormAlert>{error}</FormAlert>
      {message && <FormAlert type="success">{message}</FormAlert>}
      <DataTable columns={columns} data={certificates} searchPlaceholder="Search student, course or ID" empty="No certificates issued yet." />
    </div>
  );
};

export default CertificateTable;
