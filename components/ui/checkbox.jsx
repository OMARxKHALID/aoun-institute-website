const Checkbox = ({ label, hint, className = "", ...props }) => (
  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border border-[#302C2A] bg-[#0C0C0C] p-4 ${className}`}>
    <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[#E8602E]" {...props} />
    <span>
      <span className="block">{label}</span>
      {hint && <span className="block text-sm text-white/50">{hint}</span>}
    </span>
  </label>
);

export default Checkbox;
