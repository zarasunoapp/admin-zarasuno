import { PageHeader } from "@/components/admin/PageHeader";
import { DateRangeFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { ChartCard, BarCompare } from "@/components/admin/Charts";
import { parsePageParams, formatMoney } from "@/lib/utils";
import { getPackageReport } from "@/lib/repositories/reportRepository";

export const dynamic = "force-dynamic";

export default async function PackageReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const rows = (await getPackageReport(params)) as any[];
  const chartData = rows.slice(0, 8).map((r) => ({ name: r.package_name, value: r.amount }));

  return (
    <div>
      <PageHeader title="Package Report" action={<ExportButtons report="package" />} />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
        <DateRangeFilter />
      </div>
      <ChartCard title="Sales by Package" className="mb-6">
        <BarCompare data={chartData} xKey="name" yKey="value" color="#D9A94C" />
      </ChartCard>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-ivory/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Package</th>
              <th className="px-5 py-3">Sales Count</th>
              <th className="px-5 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="px-5 py-3">{i + 1}</td>
                <td className="px-5 py-3 font-medium">{r.package_name}</td>
                <td className="px-5 py-3">{r.count}</td>
                <td className="px-5 py-3">{formatMoney(r.amount)}</td>
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
