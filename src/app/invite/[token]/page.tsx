import { prisma } from "@/lib/prisma";
import { InviteForm } from "@/components/invite-form";
import { notFound } from "next/navigation";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) notFound();
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <div className="w-full space-y-4 rounded-3xl border border-[#2c2c32] bg-[#141416] p-8">
        <h1 className="text-2xl">Приглашение</h1>
        <InviteForm token={token} email={invite.email} />
      </div>
    </main>
  );
}
