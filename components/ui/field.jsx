const base =
  "w-full rounded-xl border bg-[#0C0C0C] px-4 py-3 text-lg text-white outline-hidden transition-colors placeholder:text-white/30 focus:border-accent aria-invalid:border-red-500/70";

const Field = ({ label, name, type = "text", options, rows, error, className = "", ...props }) => {
  const errorId = error ? `${name}-error` : undefined;
  const shared = { id: name, name, "aria-invalid": Boolean(error), "aria-describedby": errorId, className: `${base} border-[#302C2A]`, ...props };
  return (
    <div className={`flex flex-col gap-2 text-left ${className}`}>
      <label htmlFor={name} className="text-base text-white/70">
        {label}
      </label>
      {options ? (
        <select defaultValue="" {...shared}>
          <option value="" disabled>
            Select…
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
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
