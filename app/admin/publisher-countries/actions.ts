"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createPublisherCountry,
  updatePublisherCountry,
  deletePublisherCountry,
  bulkInsertPublisherCountries,
} from "@/lib/repositories/publisherCountryRepository";

const PATH = "/admin/publisher-countries";

export async function createPublisherCountryAction(formData: FormData) {
  await requireAdmin();
  try {
    await createPublisherCountry({ name: String(formData.get("name")) });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updatePublisherCountryAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updatePublisherCountry(id, { name: String(formData.get("name")) });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deletePublisherCountryAction(id: string) {
  await requireAdmin();
  await deletePublisherCountry(id);
  revalidatePath(PATH);
}

export async function importPublisherCountriesAction(rows: { name: string }[]) {
  await requireAdmin();
  try {
    await bulkInsertPublisherCountries(rows);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}
