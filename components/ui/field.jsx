import Select from "@/components/ui/select";
import { inputClass, labelClass } from "@/lib/ui";

const Field = ({ label, name, type = "text", options, rows, error, className = "", ...props }) => {
  const errorId = error ? `${name}-error` : undefined;
  const shared = { id: name, name, "aria-invalid": Boolean(error), "aria-describedby": errorId, className: inputClass, ...props };
  return (
    <div className={`flex flex-col gap-2 text-left ${className}`}>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {options ? (
        <Select defaultValue="" placeholder={options.some((o) => (typeof o === "object" ? o.value : o) === "") ? undefined : "Select…"} options={options} {...shared} />
      ) : rows ? (
        <textarea rows={rows} {...shared} />
      ) : (
        <input type={type} {...shared} />
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
