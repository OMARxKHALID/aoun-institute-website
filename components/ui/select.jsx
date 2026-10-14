import { ChevronDown } from "lucide-react";

const toOption = (o) => (typeof o === "string" ? { value: o, label: o.charAt(0).toUpperCase() + o.slice(1) } : o);

const Select = ({ options, placeholder, className = "", wrapperClassName = "", children, ...props }) => (
  <div className={`relative ${wrapperClassName}`}>
    <select {...props} className={`w-full cursor-pointer appearance-none pr-10 ${className}`}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options?.map(toOption).map(({ value, label }) => (
        <option key={value} value={value} className="bg-[#0C0C0C] text-white">
          {label}
        </option>
      ))}
      {children}
    </select>
    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-white/50" />
  </div>
);

export default Select;
