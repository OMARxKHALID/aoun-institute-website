"use client";

import { Controller, useFieldArray } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import Field from "@/components/ui/field";
import ImageUpload from "@/components/ui/image-upload";

const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

const ArrayField = ({ control, register, errors, name, label, columns, empty, max = 20, uploadKind = "brand" }) => {
  const { fields, append, remove, move } = useFieldArray({ control, name });

  const handleAdd = () => append(empty);

  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-[#302C2A] p-5">
      <legend className="px-2 font-machina text-xl">{label}</legend>
      {fields.map((item, i) => (
        <div key={item.id} className="grid gap-4 rounded-xl bg-white/[0.03] p-4 md:grid-cols-2">
          {columns.map((col) =>
            col.image ? (
              <Controller
                key={col.name}
                control={control}
                name={`${name}.${i}.${col.name}`}
                render={({ field }) => <ImageUpload kind={uploadKind} label={col.label} value={field.value} onChange={field.onChange} aspect={col.aspect} />}
              />
            ) : (
              <Field
                key={col.name}
                label={col.label}
                rows={col.rows}
                className={col.wide ? "md:col-span-2" : ""}
                error={get(errors, `${name}.${i}.${col.name}`)?.message}
                {...register(`${name}.${i}.${col.name}`)}
              />
            ),
          )}
          <div className="flex gap-2 md:col-span-2">
            <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up" className="rounded-lg p-2 text-white/60 hover:bg-white/5 disabled:opacity-30">
              <ArrowUp className="size-4" />
            </button>
            <button type="button" onClick={() => move(i, i + 1)} disabled={i === fields.length - 1} aria-label="Move down" className="rounded-lg p-2 text-white/60 hover:bg-white/5 disabled:opacity-30">
              <ArrowDown className="size-4" />
            </button>
            <button type="button" onClick={() => remove(i)} aria-label="Remove" className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10">
              <Trash2 className="size-4" /> Remove
            </button>
          </div>
        </div>
      ))}
      {fields.length < max && (
        <button type="button" onClick={handleAdd} className="flex items-center gap-2 self-start rounded-xl border border-dashed border-white/25 px-4 py-2 text-sm text-white/70 transition hover:border-accent hover:text-accent">
          <Plus className="size-4" /> Add
        </button>
      )}
    </fieldset>
  );
};

export default ArrayField;
