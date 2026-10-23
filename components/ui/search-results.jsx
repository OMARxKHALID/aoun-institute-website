import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import PanelCard from "@/components/ui/panel-card";

const SearchResults = ({ q, groups }) => {
  const filled = groups.filter((g) => g.items?.length);
  if (!q) return <p className="text-white/50">Type something in the search bar to search.</p>;
  if (!filled.length)
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#302C2A] bg-[#0C0C0C] p-10 text-center text-white/50">
        <SearchX className="size-8 text-accent" />
        No results for “{q}”.
      </div>
    );
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {filled.map((group) => (
        <PanelCard key={group.title} title={`${group.title} (${group.items.length})`}>
          <ul className="flex flex-col gap-2">
            {group.items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#070707] p-3 transition hover:border-accent/50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.title}</span>
                    {item.meta && <span className="block truncate text-xs text-white/50">{item.meta}</span>}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-white/50" />
                </Link>
              </li>
            ))}
          </ul>
        </PanelCard>
      ))}
    </div>
  );
};

export default SearchResults;
