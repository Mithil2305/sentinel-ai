import React from 'react';

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  rowClassName?: (item: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No records found.',
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="glass-panel rounded-card overflow-hidden border border-border/80 shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body border-collapse">
          <thead>
            <tr className="border-b border-border bg-card/40 text-muted font-bold text-caption uppercase tracking-wider select-none">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-4 px-6 ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.length > 0 ? (
              data.map((item, rowIdx) => {
                const customClasses = rowClassName ? rowClassName(item) : '';
                return (
                  <tr
                    key={rowIdx}
                    onClick={() => onRowClick?.(item)}
                    className={`hover:bg-border/20 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${customClasses}`}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`py-4 px-6 text-muted text-small-text font-normal ${col.className || ''}`}>
                        {col.accessor(item)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-muted font-bold text-small-text">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
