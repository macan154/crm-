import { NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/actions/reminders";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const count = await dispatchDueReminders();
  return NextResponse.json({ ok: true, count });
}
