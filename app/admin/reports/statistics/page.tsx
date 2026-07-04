import { PageHeader } from "@/components/admin/PageHeader";
import { DateRangeFilter, SelectFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { ChartCard, BarCompare, DonutDistribution } from "@/components/admin/Charts";
import { parsePageParams } from "@/lib/utils";
import { getStatisticsReport } from "@/lib/repositories/reportRepository";

export const dynamic = "force-dynamic";

const bookTypes = [
  { value: "summary", label: "Summary" },
  { value: "full", label: "Full" },
  { value: "ebook", label: "eBook" },
  { value: "audiobook", label: "Audiobook" },
];

export default async function StatisticsReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const rows = await getStatisticsReport(params);

  const byType: Record<string, number> = {};
  rows.forEach((r) => (byType[r.book_type] = (byType[r.book_type] || 0) + 1));
  const pieData = Object.entries(byType).map(([name, value]) => ({ name, value }));
  const barData = [...rows]
    .sort((a, b) => b.click_read_listen - a.click_read_listen)
    .slice(0, 8)
    .map((r) => ({ name: r.book_name, value: r.click_read_listen }));

  return (
    <div>
      <PageHeader title="Statistics Report" action={<ExportButtons report="statistics" />} />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
        <SelectFilter paramKey="type" label="Book Type" options={bookTypes} />
        <DateRangeFilter />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Books by Type">
          <DonutDistribution data={pieData} />
        </ChartCard>
        <ChartCard title="Top Titles by Clicks">
          <BarCompare data={barData} xKey="name" yKey="value" color="#D9A94C" />
        </ChartCard>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-ivory/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Book Type</th>
              <th className="px-5 py-3">Book Name</th>
              <th className="px-5 py-3">Click Read/Listen</th>
              <th className="px-5 py-3">Users In-Progress</th>
              <th className="px-5 py-3">Users Favorite</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="px-5 py-3">{i + 1}</td>
                <td className="px-5 py-3 capitalize">{r.book_type}</td>
                <td className="px-5 py-3 font-medium">{r.book_name}</td>
                <td className="px-5 py-3">{r.click_read_listen}</td>
                <td className="px-5 py-3">{r.users_in_progress}</td>
                <td className="px-5 py-3">{r.users_favorite}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted">
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
