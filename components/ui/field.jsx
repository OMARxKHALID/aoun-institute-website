import Select from "@/components/ui/select";
import DateInput from "@/components/ui/date-input";
import { inputClass, labelClass } from "@/lib/ui";

const numberClass = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return { value, label: `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` };
});

const Field = ({ label, name, type = "text", options, rows, error, className = "", ...props }) => {
  const errorId = error ? `${name}-error` : undefined;
  const shared = { id: name, name, "aria-invalid": Boolean(error), "aria-describedby": errorId, className: inputClass, ...props };
  const control = () => {
    if (options) return <Select defaultValue="" placeholder={options.some((o) => (typeof o === "object" ? o.value : o) === "") ? undefined : "Select…"} options={options} {...shared} />;
    if (rows) return <textarea rows={rows} {...shared} />;
    if (type === "date") return <DateInput {...shared} />;
    if (type === "time") return <Select placeholder="Pick a time" options={timeOptions} {...shared} />;
    return <input type={type} {...shared} className={type === "number" ? `${inputClass} ${numberClass}` : inputClass} />;
  };
  return (
    <div className={`flex flex-col gap-2 text-left ${className}`}>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {control()}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
