import { Suspense } from "react";
import PanelNav from "@/components/ui/panel-nav";
import PanelSkeleton from "@/components/ui/panel-skeleton";
import { getSiteSettings } from "@/features/site-settings/queries";

const PanelShell = async ({ panel, guard: Guard, children }) => {
  const { brand } = await getSiteSettings();
  return (
    <div className="min-h-screen bg-black p-3 lg:flex lg:gap-4 lg:p-4">
      <PanelNav panel={panel} brand={brand} />
      <main className="mt-3 min-w-0 flex-1 overflow-hidden rounded-3xl border border-white/5 bg-[#070707] lg:mt-0">
        <Suspense fallback={<PanelSkeleton />}>
          <Guard>{children}</Guard>
        </Suspense>
      </main>
    </div>
  );
};

export default PanelShell;
