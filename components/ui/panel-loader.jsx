import { Loader2 } from "lucide-react";

const PanelLoader = () => (
  <div role="status" aria-label="Loading" className="grid min-h-[60dvh] flex-1 place-items-center">
    <Loader2 className="size-8 animate-spin text-accent" />
  </div>
);

export default PanelLoader;
