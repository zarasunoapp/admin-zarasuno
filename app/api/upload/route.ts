import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadFile } from "@/lib/repositories/storageRepository";

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const bucket = formData.get("bucket") as string;
  const file = formData.get("file") as File;
  const prefix = (formData.get("prefix") as string) || "";
  if (!bucket || !file) {
    return NextResponse.json({ error: "Missing bucket or file" }, { status: 400 });
  }
  try {
    const result = await uploadFile(bucket, file, prefix);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
