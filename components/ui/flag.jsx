import { flagUrl } from "@/lib/countries";

const Flag = ({ code, name, className = "h-4 w-6" }) => <img src={flagUrl(code)} alt={name ?? code} title={name} loading="lazy" decoding="async" className={`shrink-0 rounded-[3px] object-cover ring-1 ring-white/15 ${className}`} />;

export default Flag;
