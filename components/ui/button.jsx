import { LoaderCircle } from "lucide-react";
import { buttonClass } from "@/lib/ui";

const Button = ({ children, loading, variant = "primary", size = "md", className = "", disabled, ...props }) => (
  <button disabled={disabled || loading} aria-busy={loading || undefined} className={`${buttonClass(variant, size)} ${className}`} {...props}>
    {loading && <LoaderCircle className="size-4 animate-spin" />}
    {children}
  </button>
);

export default Button;
