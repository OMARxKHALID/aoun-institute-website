"use client";

import { useState } from "react";
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Search } from "lucide-react";
import Select from "@/components/ui/select";
import Pager from "@/components/ui/pager";
import { PAGE_SIZE } from "@/hooks/use-pager";
import { searchClass } from "@/lib/ui";

const tableFeatureSet = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, datetime: sortFn_datetime },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const sortIcons = { asc: ArrowUp, desc: ArrowDown };

const cellAlign = (column) => (column.id === "actions" ? "w-px text-right [&>*]:ml-auto" : "");

const headerText = (column) => (typeof column.columnDef.header === "string" ? column.columnDef.header : column.id);

const Pagination = ({ table }) => {
  const { pageIndex, pageSize } = table.state.pagination;
  const total = table.getPrePaginatedRowModel().rows.length;
  const from = pageIndex * pageSize + 1;
  return <Pager from={from} to={Math.min(total, from + pageSize - 1)} total={total} page={pageIndex} pages={Math.max(table.getPageCount(), 1)} onPrev={() => table.previousPage()} onNext={() => table.nextPage()} />;
};

const MobileSort = ({ table }) => {
  const sortable = table.getAllLeafColumns().filter((c) => c.getCanSort());
  const [current] = table.state.sorting;
  if (!sortable.length) return null;

  const handleChange = (e) => {
    const [id, dir] = e.target.value.split(":");
    table.setSorting(id ? [{ id, desc: dir === "desc" }] : []);
  };

  return (
    <Select
      value={current ? `${current.id}:${current.desc ? "desc" : "asc"}` : ""}
      onChange={handleChange}
      aria-label="Sort by"
      options={[
        { value: "", label: "Sort by…" },
        ...sortable.flatMap((c) => [
          { value: `${c.id}:asc`, label: `${headerText(c)} (A → Z, low → high)` },
          { value: `${c.id}:desc`, label: `${headerText(c)} (Z → A, high → low)` },
        ]),
      ]}
      wrapperClassName="md:hidden"
      className="rounded-full border border-[#302C2A] bg-[#0C0C0C] py-2.5 pl-4 text-white outline-hidden focus:border-accent"
    />
  );
};

const RowCard = ({ row, table }) => {
  const [open, setOpen] = useState(false);
  const [primary, ...rest] = row.getAllCells();
  const actions = rest.filter((cell) => cell.column.id === "actions");
  const details = rest.filter((cell) => cell.column.id !== "actions");

  return (
    <li className="rounded-2xl border border-[#302C2A] bg-[#0C0C0C]">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <div className="min-w-0 flex-1 basis-48">
          <table.FlexRender cell={primary} />
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Hide details" : "Show details"}
          className="grid size-9 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {actions.map((cell) => (
          <table.FlexRender key={cell.id} cell={cell} />
        ))}
      </div>
      {open && (
        <dl className="grid grid-cols-1 gap-3 border-t border-white/5 p-4 text-sm min-[420px]:grid-cols-2">
          {details.map((cell) => (
            <div key={cell.id} className="flex min-w-0 flex-col gap-1">
              <dt className="text-xs uppercase tracking-wider text-white/50">{headerText(cell.column)}</dt>
              <dd className="min-w-0 break-words">
                <table.FlexRender cell={cell} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
};

const DataTable = ({ columns, data, searchPlaceholder = "Search", initialSearch = "", empty = "Nothing here yet." }) => {
  const [search, setSearch] = useState(initialSearch);
  const table = useTable({
    features: tableFeatureSet,
    columns,
    data,
    globalFilterFn: "includesString",
    initialState: { globalFilter: initialSearch, pagination: { pageIndex: 0, pageSize: PAGE_SIZE } },
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
    table.setGlobalFilter(e.target.value);
    table.setPageIndex(0);
  };

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative w-full sm:max-w-sm">
          <span className="sr-only">{searchPlaceholder}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className={searchClass}
          />
        </label>
        <MobileSort table={table} />
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[#302C2A] md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const SortIcon = sortIcons[sorted] ?? ArrowUpDown;
                  return (
                    <th key={header.id} scope="col" aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined} className={`whitespace-nowrap px-4 py-3 font-medium ${cellAlign(header.column)} ${header.column.columnDef.meta?.className ?? ""}`}>
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
                  <td key={cell.id} className={`px-4 py-3 align-middle ${cellAlign(cell.column)} ${cell.column.columnDef.meta?.className ?? ""}`}>
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

      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <RowCard key={row.id} row={row} table={table} />
        ))}
        {rows.length === 0 && <li className="rounded-2xl border border-[#302C2A] px-4 py-10 text-center text-white/50">{empty}</li>}
      </ul>

      <Pagination table={table} />
    </div>
  );
};

export default DataTable;
