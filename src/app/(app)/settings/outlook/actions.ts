"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn } from "@/auth";
import { syncOutlookEmailsForUser } from "@/lib/graph/sync-email";

export async function syncNow() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await syncOutlookEmailsForUser(session.user.id);
  revalidatePath("/settings/outlook");
}

export async function reconnectOutlook() {
  await signIn("microsoft-entra-id", { redirectTo: "/settings/outlook" });
}
