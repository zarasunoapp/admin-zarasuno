"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function ExportButtons({ report }: { report: string }) {
  const searchParams = useSearchParams();

  function href(format: "excel" | "pdf") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("format", format);
    return `/api/export/${report}?${params.toString()}`;
  }

  return (
    <div className="flex items-center gap-2">
      <a href={href("excel")} className="btn-primary py-2">
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </a>
      <a href={href("pdf")} className="btn-gold py-2">
        <FileText className="h-4 w-4" />
        Pdf
      </a>
    </div>
  );
}
