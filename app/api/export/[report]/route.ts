import { requireAdmin } from "@/lib/auth";
import { buildExcel, buildPdf, fileResponse, type ExportTable } from "@/lib/export";
import { formatDateTime } from "@/lib/utils";
import type { ListParams } from "@/lib/repositories/types";
import {
  listAllSalesForExport,
  reportForExport,
} from "@/lib/repositories/transactionRepository";
import {
  getConsumptionReport,
  getStatisticsReport,
  getPromocodeReport,
  getTopSellingReport,
  getLanguageReport,
  getPackageReport,
} from "@/lib/repositories/reportRepository";

async function buildTable(report: string, params: ListParams): Promise<ExportTable> {
  switch (report) {
    case "sales": {
      const rows = await listAllSalesForExport(params);
      return {
        title: "Sales",
        headers: ["#", "Date", "Transaction ID", "Order By", "Package", "Amount", "Payment Type", "Status"],
        rows: rows.map((r: any, i) => [
          i + 1,
          formatDateTime(r.created_at),
          String(r.id).slice(0, 8),
          r.profiles?.full_name || r.profiles?.email || "-",
          r.coin_packages?.name || "-",
          r.amount ?? "-",
          r.payment_provider || "-",
          r.payment_status || "-",
        ]),
      };
    }
    case "purchase": {
      const rows = await reportForExport("purchase", params);
      return {
        title: "Purchase Report",
        headers: ["#", "Date", "Transaction ID", "Order By", "Book", "Author", "Publisher", "Coins", "Payment Type"],
        rows: rows.map((r: any, i) => [
          i + 1,
          formatDateTime(r.created_at),
          String(r.id).slice(0, 8),
          r.profiles?.full_name || "-",
          r.books?.title || "-",
          r.books?.authors?.name || "-",
          r.books?.publishers?.name || "-",
          Math.abs(r.coin_change || 0),
          "Wallet",
        ]),
      };
    }
    case "coin-purchase": {
      const rows = await reportForExport("coin-purchase", params);
      return {
        title: "Coin Purchase Report",
        headers: ["#", "Date", "Transaction ID", "Order By", "Package", "Coins", "Amount", "Payment Type", "Status"],
        rows: rows.map((r: any, i) => [
          i + 1,
          formatDateTime(r.created_at),
          String(r.id).slice(0, 8),
          r.profiles?.full_name || "-",
          r.coin_packages?.name || "-",
          r.coin_change ?? "-",
          r.amount ?? "--",
          r.type === "admin_grant" ? "Admin" : r.payment_provider || "-",
          r.payment_status || "-",
        ]),
      };
    }
    case "consumption": {
      const rows = await getConsumptionReport(params);
      return {
        title: "Consumption Report",
        headers: ["#", "Book Type", "Publisher", "Book", "Users", "Total Time (min)", "Finish Clicked", "Consumption Share"],
        rows: rows.map((r, i) => [
          i + 1,
          r.book_type,
          r.publisher_name,
          r.book_name,
          r.number_of_users,
          r.total_minutes,
          r.finish_clicked,
          r.consumption_share,
        ]),
      };
    }
    case "statistics": {
      const rows = await getStatisticsReport(params);
      return {
        title: "Statistics Report",
        headers: ["#", "Book Type", "Book", "Click Read/Listen", "Users In-Progress", "Users Favorite"],
        rows: rows.map((r, i) => [i + 1, r.book_type, r.book_name, r.click_read_listen, r.users_in_progress, r.users_favorite]),
      };
    }
    case "promocode": {
      const rows = await getPromocodeReport(params);
      return {
        title: "Promocode Report",
        headers: ["#", "Code", "Name", "User", "Coins", "Date"],
        rows: rows.map((r, i) => [i + 1, r.code, r.name, r.user, r.coins, formatDateTime(r.date)]),
      };
    }
    case "top-selling": {
      const rows = await getTopSellingReport(params);
      return {
        title: "Top Selling Books",
        headers: ["#", "Book", "Book Type", "Unlocks"],
        rows: rows.map((r: any, i) => [i + 1, r.book_name, r.book_type, r.count]),
      };
    }
    case "language": {
      const rows = await getLanguageReport(params);
      return {
        title: "Language Report",
        headers: ["#", "Language", "Books", "Listens"],
        rows: rows.map((r: any, i) => [i + 1, r.language, r.books, r.listens]),
      };
    }
    case "package": {
      const rows = await getPackageReport(params);
      return {
        title: "Package Report",
        headers: ["#", "Package", "Sales Count", "Amount"],
        rows: rows.map((r: any, i) => [i + 1, r.package_name, r.count, r.amount]),
      };
    }
    default:
      return { title: "Report", headers: [], rows: [] };
  }
}

export async function GET(
  request: Request,
  { params }: { params: { report: string } }
) {
  await requireAdmin();
  const url = new URL(request.url);
  const format = (url.searchParams.get("format") as "excel" | "pdf") || "excel";
  const listParams: ListParams = {
    q: url.searchParams.get("q") || undefined,
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    type: url.searchParams.get("type") || undefined,
    status: url.searchParams.get("status") || undefined,
    filter: url.searchParams.get("filter") || undefined,
  };

  const table = await buildTable(params.report, listParams);
  const filename = `${params.report}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "pdf") {
    const pdf = await buildPdf(table);
    return fileResponse(pdf, filename, "pdf");
  }
  const excel = buildExcel(table);
  return fileResponse(excel, filename, "excel");
}
