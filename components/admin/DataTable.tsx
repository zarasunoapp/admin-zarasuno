import { TableToolbar } from "./TableToolbar";
import { Pagination } from "./Pagination";
import {
  SelectionProvider,
  HeaderCheckbox,
  RowCheckbox,
  BulkDeleteBar,
} from "./Selection";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  count,
  page,
  perPage,
  toolbar,
  action,
  searchPlaceholder,
  emptyMessage = "No records found.",
  bulkDelete,
  bulkLabel = "items",
}: {
  columns: Column<T>[];
  rows: T[];
  count: number;
  page: number;
  perPage: number;
  toolbar?: React.ReactNode;
  action?: React.ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: string;
  bulkDelete?: (ids: string[]) => Promise<{ error?: string } | void>;
  bulkLabel?: string;
}) {
  const selectable = !!bulkDelete;
  const ids = selectable ? rows.map((r) => String((r as any).id)) : [];
  const colSpan = columns.length + (selectable ? 1 : 0);

  const body = (
    <>
      <TableToolbar action={action} placeholder={searchPlaceholder}>
        {toolbar}
      </TableToolbar>
      {selectable && <BulkDeleteBar bulkDelete={bulkDelete!} label={bulkLabel} />}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-ivory/60 text-xs uppercase tracking-wide text-muted">
              {selectable && (
                <th className="w-10 px-5 py-3">
                  <HeaderCheckbox />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={`px-5 py-3 font-semibold ${col.className || ""}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-5 py-12 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={(row as any).id ?? index}
                  className="border-b border-black/5 transition last:border-0 hover:bg-ivory/50"
                >
                  {selectable && (
                    <td className="px-5 py-3.5">
                      <RowCheckbox id={String((row as any).id)} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-3.5 text-ink ${col.className || ""}`}>
                      {col.render
                        ? col.render(row, index)
                        : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className="card overflow-hidden">
      {selectable ? <SelectionProvider ids={ids}>{body}</SelectionProvider> : body}
      <Pagination page={page} perPage={perPage} count={count} />
    </div>
  );
}
