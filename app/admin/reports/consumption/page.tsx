import { PageHeader } from "@/components/admin/PageHeader";
import { DateRangeFilter, SelectFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { ChartCard, BarCompare } from "@/components/admin/Charts";
import { parsePageParams } from "@/lib/utils";
import { getConsumptionReport } from "@/lib/repositories/reportRepository";

export const dynamic = "force-dynamic";

const bookTypes = [
  { value: "summary", label: "Summary" },
  { value: "full", label: "Full" },
  { value: "ebook", label: "eBook" },
  { value: "audiobook", label: "Audiobook" },
];

export default async function ConsumptionReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const rows = await getConsumptionReport(params);
  const chartData = rows.slice(0, 8).map((r) => ({ name: r.book_name, value: r.total_minutes }));

  return (
    <div>
      <PageHeader title="Consumption Report" action={<ExportButtons report="consumption" />} />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
        <SelectFilter paramKey="type" label="Book Type" options={bookTypes} />
        <DateRangeFilter />
      </div>
      <ChartCard title="Top Books by Minutes Consumed" className="mb-6">
        <BarCompare data={chartData} xKey="name" yKey="value" />
      </ChartCard>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-ivory/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Book Type</th>
              <th className="px-5 py-3">Publisher</th>
              <th className="px-5 py-3">Book Name</th>
              <th className="px-5 py-3">Number of Users</th>
              <th className="px-5 py-3">Total Time (min)</th>
              <th className="px-5 py-3">Finish Clicked</th>
              <th className="px-5 py-3">Consumption Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="px-5 py-3">{i + 1}</td>
                <td className="px-5 py-3 capitalize">{r.book_type}</td>
                <td className="px-5 py-3">{r.publisher_name}</td>
                <td className="px-5 py-3 font-medium">{r.book_name}</td>
                <td className="px-5 py-3">{r.number_of_users}</td>
                <td className="px-5 py-3">{r.total_minutes}</td>
                <td className="px-5 py-3">{r.finish_clicked}</td>
                <td className="px-5 py-3">{r.consumption_share}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-muted">
                  No data for selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
