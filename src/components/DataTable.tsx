import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  rowClass?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
}

export default function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search records...",
  searchFilter,
  pageSize = 5,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items matching query
  const filteredData = searchFilter && searchQuery
    ? data.filter((item) => searchFilter(item, searchQuery))
    : data;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Panel */}
      {searchFilter && (
        <div className="relative flex items-center max-w-sm">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset to first page
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-200 outline-none placeholder-slate-500 focus:border-indigo-500 transition-all font-medium"
          />
        </div>
      )}

      {/* Structured Datagrid Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.01]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-slate-300 font-bold uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-5 py-3.5 text-[10px] font-bold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-white/[0.02] transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-5 py-3 text-slate-200 font-medium ${col.rowClass || ""}`}
                    >
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500 space-y-2">
                  <Inbox className="h-8 w-8 mx-auto opacity-40 animate-pulse text-indigo-400" />
                  <p className="font-semibold text-xs text-slate-400">No records found matching criteria</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controller Row */}
      {filteredData.length > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 bg-white/5 border border-white/5 text-slate-300 rounded shadow hover:bg-white/10 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-300 font-bold px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 bg-white/5 border border-white/5 text-slate-300 rounded shadow hover:bg-white/10 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
