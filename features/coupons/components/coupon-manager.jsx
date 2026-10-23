"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { Pause, Play, Trash2 } from "lucide-react";
import { createCoupon, deleteCoupon, setCouponActive } from "@/features/coupons/actions";
import { couponSchema } from "@/features/coupons/schemas";
import DataTable from "@/components/ui/data-table";
import ActionMenu from "@/components/ui/action-menu";
import Field from "@/components/ui/field";
import Button from "@/components/ui/button";
import FormAlert from "@/components/ui/form-alert";
import PanelCard from "@/components/ui/panel-card";
import StatusPill from "@/components/ui/status-pill";
import { formatPrice } from "@/lib/format";
import { useDialog } from "@/components/ui/dialog-provider";
import { numberOrNull } from "@/lib/validate";

const helper = createColumnHelper();

const KINDS = [
  { value: "percent", label: "Percent off" },
  { value: "fixed", label: "Fixed amount off (PKR)" },
];

const stateTone = { active: "green", paused: "gray", expired: "red", "used up": "amber" };


const CouponManager = ({ coupons, courses }) => {
  const dialog = useDialog();
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { register, control, handleSubmit, setError: setFieldError, reset, formState } = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: "", kind: "percent", value: 10, courseId: "", expiresOn: "", maxUses: null },
  });
  const { errors, isSubmitting } = formState;
  const kind = useWatch({ control, name: "kind" });

  const handleCreate = async (values) => {
    setMessage(null);
    const result = await createCoupon(values);
    if (!result.ok) return Object.entries(result.errors).forEach(([field, messages]) => setFieldError(field, { message: messages[0] }));
    reset();
    setMessage(`Coupon ${values.code} created.`);
    router.refresh();
  };

  const run = async (action) => {
    const result = await action();
    if (!result.ok) return setError(Object.values(result.errors).flat()[0]);
    setError(null);
    router.refresh();
  };

  const handleDelete = async (c) => {
    if (await dialog.confirm({ title: `Delete ${c.code}?`, message: "Students can no longer use it. Orders that already used it keep their discount.", confirmLabel: "Delete", danger: true })) run(() => deleteCoupon(c.id));
  };

  const columns = helper.columns([
    helper.accessor("code", { header: "Code", cell: ({ getValue }) => <span className="font-mono font-medium">{getValue()}</span> }),
    helper.accessor("value", { header: "Discount", cell: ({ row }) => (row.original.kind === "percent" ? `${row.original.value}% off` : `${formatPrice(row.original.value)} off`) }),
    helper.accessor("course", { header: "Course" }),
    helper.accessor("uses", { header: "Used", cell: ({ row }) => `${row.original.uses}${row.original.maxUses ? ` / ${row.original.maxUses}` : ""}` }),
    helper.accessor((row) => row.expiresOn ?? "", { id: "expiresOn", header: "Expires", cell: ({ row }) => <span className="text-white/70">{row.original.expiresOn ?? "Never"}</span> }),
    helper.accessor("state", { header: "Status", cell: ({ getValue }) => <StatusPill status={getValue()} tone={stateTone[getValue()]} /> }),
    helper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <ActionMenu
            label={`Actions for ${c.code}`}
            items={[
              c.active ? { label: "Pause", icon: Pause, onClick: () => run(() => setCouponActive(c.id, false)) } : { label: "Resume", icon: Play, onClick: () => run(() => setCouponActive(c.id, true)) },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => handleDelete(c) },
            ]}
          />
        );
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PanelCard title="New coupon">
        <form onSubmit={handleSubmit(handleCreate)} noValidate className="grid gap-4 md:grid-cols-2">
          <Field label="Code" placeholder="e.g. WELCOME20" autoComplete="off" error={errors.code?.message} {...register("code", { setValueAs: (v) => v.trim().toUpperCase() })} />
          <Field label="Type" options={KINDS} error={errors.kind?.message} {...register("kind")} />
          <Field label={kind === "percent" ? "Percent off" : "Amount off (PKR)"} type="number" min="1" step="1" error={errors.value?.message} {...register("value", { valueAsNumber: true })} />
          <Field label="Course" options={courses} error={errors.courseId?.message} {...register("courseId")} />
          <Field label="Expires on (optional)" type="date" error={errors.expiresOn?.message} {...register("expiresOn")} />
          <Field label="Max uses (optional)" type="number" min="1" step="1" placeholder="Unlimited" error={errors.maxUses?.message} {...register("maxUses", { setValueAs: numberOrNull })} />
          <div className="flex flex-col gap-3 md:col-span-2">
            <FormAlert>{errors.root?.message}</FormAlert>
            {message && <FormAlert type="success">{message}</FormAlert>}
            <Button type="submit" loading={isSubmitting} className="self-start">
              Create coupon
            </Button>
          </div>
        </form>
      </PanelCard>
      <FormAlert>{error}</FormAlert>
      <DataTable columns={columns} data={coupons} searchPlaceholder="Search codes or courses" empty="No coupons yet." />
    </div>
  );
};

export default CouponManager;
