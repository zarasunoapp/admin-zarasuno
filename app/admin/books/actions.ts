"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createBook,
  updateBook,
  deleteBook,
  duplicateBook,
  toggleBookFlag,
} from "@/lib/repositories/bookRepository";
import {
  createChapter,
  bulkCreateChapters,
  updateChapter,
  deleteChapter,
  reorderChapters,
  renameChapter,
} from "@/lib/repositories/chapterRepository";
import { signedAudioUrl } from "@/lib/repositories/storageRepository";

export async function getChapterAudioUrlAction(audioPath: string) {
  await requireAdmin();
  if (!audioPath) return { url: null as string | null };
  if (/^https?:\/\//.test(audioPath)) return { url: audioPath };
  const url = await signedAudioUrl(audioPath, 3600);
  return { url };
}

const PATH = "/admin/books";

function num(v: FormDataEntryValue | null) {
  return v === null || v === "" ? null : Number(v);
}

function parseBook(formData: FormData) {
  const metadata = {
    author_2_id: formData.get("author_2_id") || null,
    author_3_id: formData.get("author_3_id") || null,
    author_4_id: formData.get("author_4_id") || null,
    decade_published: formData.get("decade_published") || null,
    isbn10: formData.get("isbn10") || null,
    isbn13: formData.get("isbn13") || null,
    edition: formData.get("edition") || null,
    keywords: formData.get("keywords") || null,
    profession: formData.get("profession") || null,
    target_audience: formData.get("target_audience") || null,
    gender: formData.get("gender") || null,
    classification: formData.get("classification") || null,
    original_content: formData.get("original_content") || null,
    print_length: formData.get("print_length") || null,
    audiobook_length: formData.get("audiobook_length") || null,
    max_consumption_cap: formData.get("max_consumption_cap") || null,
    country_include: formData.get("country_include") || null,
    country_exclude: formData.get("country_exclude") || null,
  };
  return {
    title: String(formData.get("title")),
    subtitle: (formData.get("subtitle") as string) || null,
    description: (formData.get("description") as string) || null,
    book_type: String(formData.get("book_type") || "summary"),
    author_id: (formData.get("author_id") as string) || null,
    publisher_id: (formData.get("publisher_id") as string) || null,
    year_published: num(formData.get("year_published")),
    subcategory_id: (formData.get("subcategory_id") as string) || null,
    language_code: (formData.get("language_code") as string) || null,
    is_free: formData.get("is_free") === "true",
    coin_price: num(formData.get("coin_price")) ?? 0,
    show_ads: formData.get("show_ads") === "true",
    is_published: formData.get("is_published") === "true",
    cover_url: (formData.get("cover_url") as string) || null,
    metadata,
  };
}

export async function createBookAction(formData: FormData) {
  await requireAdmin();
  const book = await createBook(parseBook(formData));
  revalidatePath(PATH);
  redirect(`/admin/books/${book.id}/edit`);
}

export async function updateBookAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateBook(id, parseBook(formData));
    revalidatePath(PATH);
    revalidatePath(`/admin/books/${id}/edit`);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteBookAction(id: string) {
  await requireAdmin();
  await deleteBook(id);
  revalidatePath(PATH);
}

export async function duplicateBookAction(id: string) {
  await requireAdmin();
  await duplicateBook(id);
  revalidatePath(PATH);
}

export async function toggleBookFlagAction(
  id: string,
  flag: "is_book_of_day" | "is_top_selling" | "is_recommended",
  value: boolean
) {
  await requireAdmin();
  await toggleBookFlag(id, flag, value);
  revalidatePath(PATH);
}

export async function createChapterAction(bookId: string, formData: FormData) {
  await requireAdmin();
  try {
    await createChapter({
      book_id: bookId,
      chapter_number: Number(formData.get("chapter_number") || 1),
      title: String(formData.get("title")),
      audio_path: (formData.get("audio_path") as string) || "",
      duration_seconds: num(formData.get("duration_seconds")),
      is_preview: formData.get("is_preview") === "true",
    });
    revalidatePath(`/admin/books/${bookId}/edit`);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function createTextChapterAction(bookId: string, formData: FormData) {
  await requireAdmin();
  try {
    await createChapter({
      book_id: bookId,
      chapter_number: 1,
      title: String(formData.get("title") || "Untitled"),
      audio_path: "",
      is_preview: formData.get("is_preview") === "true",
      content: String(formData.get("content") || ""),
    });
    revalidatePath(`/admin/books/${bookId}/edit`);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function bulkCreateChaptersAction(
  bookId: string,
  rows: { title: string; audio_path?: string | null; duration_seconds?: number | null; is_preview?: boolean }[]
) {
  await requireAdmin();
  try {
    await bulkCreateChapters(bookId, rows);
    revalidatePath(`/admin/books/${bookId}/edit`);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateChapterAction(id: string, bookId: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateChapter(id, bookId, {
      title: String(formData.get("title")),
      audio_path: (formData.get("audio_path") as string) || "",
      is_preview: formData.get("is_preview") === "true",
      content: String(formData.get("content") || ""),
    });
    revalidatePath(`/admin/books/${bookId}/edit`);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function renameChapterAction(id: string, bookId: string, title: string) {
  await requireAdmin();
  try {
    await renameChapter(id, title.trim() || "Untitled");
    revalidatePath(`/admin/books/${bookId}/edit`);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteChapterAction(id: string, bookId: string) {
  await requireAdmin();
  await deleteChapter(id, bookId);
  revalidatePath(`/admin/books/${bookId}/edit`);
}

export async function reorderChaptersAction(bookId: string, orderedIds: string[]) {
  await requireAdmin();
  await reorderChapters(bookId, orderedIds);
  revalidatePath(`/admin/books/${bookId}/edit`);
}
