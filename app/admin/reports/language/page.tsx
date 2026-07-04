import { PageHeader } from "@/components/admin/PageHeader";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { ChartCard, DonutDistribution } from "@/components/admin/Charts";
import { parsePageParams } from "@/lib/utils";
import { getLanguageReport } from "@/lib/repositories/reportRepository";

export const dynamic = "force-dynamic";

export default async function LanguageReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const rows = (await getLanguageReport(params)) as any[];
  const pieData = rows.map((r) => ({ name: r.language, value: r.books }));

  return (
    <div>
      <PageHeader title="Language Report" action={<ExportButtons report="language" />} />
      <ChartCard title="Books by Language" className="mb-6">
        <DonutDistribution data={pieData} />
      </ChartCard>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead className="bg-ivory/60 text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Language</th>
              <th className="px-5 py-3">Books</th>
              <th className="px-5 py-3">Listens</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-black/5">
                <td className="px-5 py-3">{i + 1}</td>
                <td className="px-5 py-3 font-medium uppercase">{r.language}</td>
                <td className="px-5 py-3">{r.books}</td>
                <td className="px-5 py-3">{r.listens}</td>
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
