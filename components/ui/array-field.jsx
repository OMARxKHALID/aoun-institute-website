"use client";

import { useState } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import Field from "@/components/ui/field";
import ImageUpload from "@/components/ui/image-upload";

const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

const ArrayField = ({ control, register, errors, name, label, columns, empty, max = 20, uploadKind = "brand" }) => {
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const values = useWatch({ control, name }) ?? [];
  const [openId, setOpenId] = useState(null);
  const summaryKey = columns.find((c) => !c.image)?.name;

  const handleAdd = () => {
    append(empty);
    setOpenId("new");
  };

  const handleToggle = (id) => () => setOpenId((current) => (current === id ? null : id));

  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#302C2A] p-4 md:p-5">
      <legend className="px-2 font-machina text-xl">
        {label} <span className="text-base text-white/40">({fields.length})</span>
      </legend>
      {fields.map((item, i) => {
        const isOpen = openId === item.id || (openId === "new" && i === fields.length - 1);
        const hasError = Boolean(get(errors, `${name}.${i}`));
        const summary = values[i]?.[summaryKey] || "Untitled";
        return (
          <div key={item.id} className={`rounded-xl border ${hasError ? "border-red-500/50" : "border-white/5"} bg-white/[0.03]`}>
            <div className="flex items-center gap-1 px-3 py-2">
              <button type="button" onClick={handleToggle(item.id)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left">
                <ChevronDown className={`size-4 shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                <span className="truncate">{summary}</span>
              </button>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up" className="rounded-lg p-2 text-white/50 hover:bg-white/5 disabled:opacity-25">
                <ArrowUp className="size-4" />
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === fields.length - 1} aria-label="Move down" className="rounded-lg p-2 text-white/50 hover:bg-white/5 disabled:opacity-25">
                <ArrowDown className="size-4" />
              </button>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${summary}`} className="rounded-lg p-2 text-red-300/80 hover:bg-red-500/10">
                <Trash2 className="size-4" />
              </button>
            </div>
            <div hidden={!isOpen} className="grid gap-4 border-t border-white/5 p-4 md:grid-cols-2">
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
            </div>
          </div>
        );
      })}
      {fields.length < max && (
        <button type="button" onClick={handleAdd} className="flex items-center gap-2 self-start rounded-xl border border-dashed border-white/25 px-4 py-2 text-sm text-white/70 transition hover:border-accent hover:text-accent">
          <Plus className="size-4" /> Add
        </button>
      )}
    </fieldset>
  );
};

export default ArrayField;
