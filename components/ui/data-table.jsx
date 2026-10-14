"use client";

import { useState } from "react";
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";

export const tableFeatureSet = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

const sortIcons = { asc: ArrowUp, desc: ArrowDown };

const DataTable = ({ columns, data, searchPlaceholder = "Search", initialSearch = "", empty = "Nothing here yet." }) => {
  const [search, setSearch] = useState(initialSearch);
  const table = useTable({ features: tableFeatureSet, columns, data, globalFilterFn: "includesString", initialState: { globalFilter: initialSearch } });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    table.setGlobalFilter(e.target.value);
  };

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <label className="relative max-w-sm">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
        <input
          type="search"
          value={search}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          className="w-full rounded-full border border-[#302C2A] bg-[#0C0C0C] py-2.5 pl-11 pr-4 outline-hidden placeholder:text-white/30 focus:border-accent"
        />
      </label>
      <div className="overflow-x-auto rounded-2xl border border-[#302C2A]">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-white/[0.03] text-sm text-white/50">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const SortIcon = sortIcons[sorted] ?? ArrowUpDown;
                  return (
                    <th key={header.id} scope="col" aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined} className="px-4 py-3 font-medium">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button type="button" onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-1.5 hover:text-white">
                          <table.FlexRender header={header} />
                          <SortIcon className={`size-3.5 ${sorted ? "text-accent" : "opacity-40"}`} />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#302C2A] transition hover:bg-white/[0.02]">
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-white/50">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
