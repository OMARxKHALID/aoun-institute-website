import { CircleAlert, CircleCheck } from "lucide-react";

const FormAlert = ({ type = "error", children }) => {
  if (!children) return null;
  const ok = type === "success";
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <div role={ok ? "status" : "alert"} className={`flex items-start gap-3 rounded-xl border p-4 text-left ${ok ? "border-green-500/40 bg-green-500/5 text-green-400" : "border-red-500/40 bg-red-500/5 text-red-400"}`}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
};

export default FormAlert;
