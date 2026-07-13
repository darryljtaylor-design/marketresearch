import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncOutlookEmailsForUser } from "@/lib/graph/sync-email";

// Hit this on a schedule so inbox email gets pulled in automatically even
// when nobody has the CRM open. Protect it with CRON_SECRET in production.
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get("authorization");
    if (header !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const connectedUsers = await prisma.account.findMany({
    where: { provider: "microsoft-entra-id", refresh_token: { not: null } },
    select: { userId: true },
    distinct: ["userId"],
  });

  const results = [];
  for (const { userId } of connectedUsers) {
    try {
      const result = await syncOutlookEmailsForUser(userId);
      results.push({ userId, ...result });
    } catch (err) {
      results.push({ userId, error: err instanceof Error ? err.message : "sync failed" });
    }
  }

  return NextResponse.json({ ok: true, results });
}
