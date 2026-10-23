"use client";

import { createContext, use, useCallback, useEffect, useRef, useState } from "react";
import { CircleHelp, TriangleAlert } from "lucide-react";
import { buttonClass, inputClass, labelClass } from "@/lib/ui";

const DialogContext = createContext(null);

export const useDialog = () => use(DialogContext);

const DialogProvider = ({ children }) => {
  const dialogRef = useRef(null);
  const resolveRef = useRef(null);
  const [state, setState] = useState(null);
  const [value, setValue] = useState("");

  const open = useCallback(
    (kind, options) =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setValue(options.defaultValue ?? "");
        setState({ kind, ...options });
      }),
    [],
  );

  const confirm = useCallback((options) => open("confirm", options), [open]);
  const prompt = useCallback((options) => open("prompt", options), [open]);

  useEffect(() => {
    if (state && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [state]);

  const finish = (result) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    dialogRef.current?.close();
    setState(null);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    finish(state?.kind === "prompt" ? null : false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    finish(state.kind === "prompt" ? (state.inputType === "password" ? value : value.trim()) : true);
  };

  const handleBackdrop = (e) => {
    if (e.target === dialogRef.current) finish(state?.kind === "prompt" ? null : false);
  };

  const minLength = state?.minLength ?? (state?.required ? 1 : 0);
  const invalid = state?.kind === "prompt" && value.trim().length < minLength;
  const Icon = state?.danger ? TriangleAlert : CircleHelp;

  return (
    <DialogContext value={{ confirm, prompt }}>
      {children}
      <dialog
        ref={dialogRef}
        onCancel={handleCancel}
        onClick={handleBackdrop}
        aria-labelledby="app-dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-0 text-white shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop:bg-black/70 backdrop:backdrop-blur-sm transition duration-150 starting:open:scale-95 starting:open:opacity-0"
      >
        {state && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
            <div className="flex items-start gap-4">
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${state.danger ? "bg-red-500/15 text-red-400" : "bg-accent/15 text-accent"}`}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="app-dialog-title" className="font-machina text-xl leading-tight">
                  {state.title}
                </h2>
                {state.message && <p className="mt-1.5 text-sm text-white/70">{state.message}</p>}
              </div>
            </div>

            {state.details?.length > 0 && (
              <dl className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-[#070707] px-4 text-sm">
                {state.details.map(([label, detail]) => (
                  <div key={label} className="flex justify-between gap-4 py-2.5">
                    <dt className="shrink-0 text-white/50">{label}</dt>
                    <dd className="min-w-0 break-words text-right font-medium">{detail}</dd>
                  </div>
                ))}
              </dl>
            )}

            {state.kind === "prompt" && (
              <label className="flex flex-col gap-2">
                {state.label && <span className={labelClass}>{state.label}</span>}
                {state.multiline === false ? (
                  <input
                    autoFocus
                    type={state.inputType ?? "text"}
                    autoComplete={state.inputType === "password" ? "new-password" : "off"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={state.placeholder}
                    maxLength={state.maxLength ?? 500}
                    className={inputClass}
                  />
                ) : (
                  <textarea
                    autoFocus
                    rows={3}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={state.placeholder}
                    maxLength={state.maxLength ?? 1000}
                    className={inputClass}
                  />
                )}
              </label>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => finish(state.kind === "prompt" ? null : false)} className={buttonClass("outline")}>
                {state.cancelLabel ?? "Cancel"}
              </button>
              <button type="submit" autoFocus={state.kind === "confirm"} disabled={invalid} className={buttonClass(state.danger ? "danger" : "primary")}>
                {state.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </DialogContext>
  );
};

export default DialogProvider;
