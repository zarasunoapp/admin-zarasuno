import { PageHeader } from "@/components/admin/PageHeader";
import { DateRangeFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { ChartCard, BarCompare } from "@/components/admin/Charts";
import { parsePageParams } from "@/lib/utils";
import { getTopSellingReport } from "@/lib/repositories/reportRepository";

export const dynamic = "force-dynamic";

export default async function TopSellingReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const rows = (await getTopSellingReport(params)) as any[];
  const chartData = rows.slice(0, 8).map((r) => ({ name: r.book_name, value: r.count }));

  return (
    <div>
      <PageHeader title="Top Selling Books" action={<ExportButtons report="top-selling" />} />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
        <DateRangeFilter />
      </div>
      <ChartCard title="Top Books by Unlocks" className="mb-6">
        <BarCompare data={chartData} xKey="name" yKey="value" />
      </ChartCard>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-ivory/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Book Name</th>
              <th className="px-5 py-3">Book Type</th>
              <th className="px-5 py-3">Unlocks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="px-5 py-3">{i + 1}</td>
                <td className="px-5 py-3 font-medium">{r.book_name}</td>
                <td className="px-5 py-3 capitalize">{r.book_type}</td>
                <td className="px-5 py-3">{r.count}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  No data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
