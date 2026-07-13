import { NextResponse } from "next/server";
import { generateTaskDueNotifications } from "@/lib/notifications";

// Hit this on a schedule (Vercel Cron, Azure Logic App, plain cron + curl,
// GitHub Actions schedule, etc.) so follow-up notifications go out even for
// users who don't have the app open. Protect it with CRON_SECRET in
// production - see README for setup.
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get("authorization");
    if (header !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await generateTaskDueNotifications();
  return NextResponse.json({ ok: true });
}
