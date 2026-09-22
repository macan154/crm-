"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/session";
import { audit } from "@/lib/audit";
import { saveUpload } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import type { DocumentCategory } from "@prisma/client";

export async function uploadDocument(formData: FormData) {
  const user = await requireWriter();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) throw new Error("Выберите файл");
  const stored = await saveUpload(file);
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const doc = await prisma.document.create({
    data: {
      title: String(formData.get("title") ?? file.name),
      category: (String(formData.get("category") ?? "COMMERCIAL") as DocumentCategory) || "COMMERCIAL",
      tags,
      url: stored.url,
      mimeType: stored.mimeType,
      size: stored.size,
      contactId: String(formData.get("contactId") ?? "") || null,
      eventId: String(formData.get("eventId") ?? "") || null,
      sponsorshipId: String(formData.get("sponsorshipId") ?? "") || null,
      fieldKey: String(formData.get("fieldKey") ?? "") || null,
      uploadedById: user.id,
    },
  });
  await audit(user.id, "create", "Document", doc.id);
  revalidatePath("/documents");
  revalidatePath("/sponsors");
}
