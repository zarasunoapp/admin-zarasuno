"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] || "").trim()));
    return row;
  });
}

export function CsvImport({
  headers,
  action,
  label = "Import",
}: {
  headers: string[];
  action: (rows: any[]) => Promise<{ error?: string } | void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function sampleHref() {
    const csv = `${headers.join(",")}\n`;
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    startTransition(async () => {
      const res = await action(rows);
      if (res && res.error) setError(res.error);
      else router.refresh();
    });
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      <a href={sampleHref()} download="sample.csv" className="btn-ghost py-2">
        <Download className="h-4 w-4" />
        Sample File
      </a>
      <label className="btn-ghost cursor-pointer py-2">
        <Upload className="h-4 w-4" />
        {pending ? "Importing..." : label}
        <input type="file" accept=".csv" className="hidden" onChange={handle} />
      </label>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
