import { PageHeader } from "@/components/admin/PageHeader";
import { DateRangeFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { parsePageParams, formatDateTime } from "@/lib/utils";
import { getPromocodeReport } from "@/lib/repositories/reportRepository";

export const dynamic = "force-dynamic";

export default async function PromocodeReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const rows = await getPromocodeReport(params);

  return (
    <div>
      <PageHeader title="Promocode Report" action={<ExportButtons report="promocode" />} />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
        <DateRangeFilter />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-ivory/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Coins</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="px-5 py-3">{i + 1}</td>
                <td className="px-5 py-3 font-mono text-xs font-bold text-gold-600">{r.code}</td>
                <td className="px-5 py-3">{r.name}</td>
                <td className="px-5 py-3">{r.user}</td>
                <td className="px-5 py-3">{r.coins}</td>
                <td className="px-5 py-3 text-muted">{formatDateTime(r.date)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted">
                  No redemptions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
