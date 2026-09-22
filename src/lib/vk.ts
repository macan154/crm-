import { prisma } from "@/lib/prisma";

export type VkPostInput = {
  message: string;
  imageUrl?: string | null;
};

export async function publishVkPost(input: VkPostInput) {
  const settings = await prisma.appSettings.findUnique({ where: { id: "default" } });
  const token = process.env.VK_TOKEN || settings?.vkToken;
  const groupId = process.env.VK_GROUP_ID || settings?.vkGroupId;
  if (!token || !groupId) {
    return { ok: false, copy: input.message, error: "VK не настроен: скопируйте текст вручную" };
  }

  try {
    let attachments = "";
    if (input.imageUrl) {
      const uploadServer = await vk("photos.getWallUploadServer", { group_id: groupId, access_token: token });
      const image = await fetch(input.imageUrl);
      const blob = await image.blob();
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");
      const uploaded = await fetch(uploadServer.upload_url, { method: "POST", body: form }).then((r) => r.json());
      const saved = await vk("photos.saveWallPhoto", {
        group_id: groupId,
        photo: uploaded.photo,
        server: String(uploaded.server),
        hash: uploaded.hash,
        access_token: token,
      });
      const photo = Array.isArray(saved) ? saved[0] : saved;
      if (photo?.owner_id && photo?.id) attachments = `photo${photo.owner_id}_${photo.id}`;
    }

    const post = await vk("wall.post", {
      owner_id: `-${groupId.replace(/^-/, "")}`,
      from_group: "1",
      message: input.message,
      attachments,
      access_token: token,
    });
    const postId = post?.post_id;
    const url = postId ? `https://vk.com/wall-${groupId.replace(/^-/, "")}_${postId}` : undefined;
    return { ok: true, url, copy: input.message };
  } catch (error) {
    return {
      ok: false,
      copy: input.message,
      error: error instanceof Error ? error.message : "VK API ошибка",
    };
  }
}

async function vk(method: string, params: Record<string, string>) {
  const search = new URLSearchParams({ v: "5.199", ...params });
  const res = await fetch(`https://api.vk.com/method/${method}?${search.toString()}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.error_msg ?? "VK error");
  return json.response;
}
