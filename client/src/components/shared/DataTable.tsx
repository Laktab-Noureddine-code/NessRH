import { cn } from "@/lib/utils";
import type React from "react";

// ── Column definition ──
export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

// ── Props ──
type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  onSelectChange?: (ids: Set<string | number>) => void;
  getRowId: (row: T) => string | number;
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
};

export default function DataTable<T>({
  columns,
  data,
  selectable = false,
  getRowId,
  sortColumn,
  sortDirection = "asc",
  onSort,
  actions,
  emptyMessage = "No data found.",
  isLoading = false,
}: DataTableProps<T>) {



  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        {/* Head */}
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap",
                  col.sortable && "cursor-pointer select-none hover:text-gray-700",
                  col.className
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <SortIcon active={sortColumn === col.key} direction={sortDirection} />
                  )}
                </span>
              </th>
            ))}
            {actions && <th className="w-20 px-4 py-3" />}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-gray-50">
                {selectable && <td className="px-4 py-4"><div className="h-4 w-4 animate-pulse rounded bg-gray-200" /></td>}
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
                {actions && <td className="px-4 py-4"><div className="h-4 w-12 animate-pulse rounded bg-gray-200" /></td>}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="px-4 py-12 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = getRowId(row);
              return (
                <tr
                  key={id}
                  className={cn(
                    "border-b border-gray-50 transition-colors hover:bg-gray-50/60"
                  )}
                >
                  
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-gray-700 whitespace-nowrap", col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Sort icon ──
function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={cn("transition-colors", active ? "text-gray-700" : "text-gray-300")}>
      <path d="M6 1.5L9 5H3L6 1.5Z" fill={active && direction === "asc" ? "currentColor" : "#d1d5db"} />
      <path d="M6 10.5L3 7H9L6 10.5Z" fill={active && direction === "desc" ? "currentColor" : "#d1d5db"} />
    </svg>
  );
}
