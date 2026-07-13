import { prisma } from "@/lib/prisma";

const PROVIDER = "microsoft-entra-id";

// Returns a valid Graph API access token for the given user, transparently
// refreshing it via the stored refresh_token when the current one has
// expired (or is about to). Returns null if the user hasn't connected
// Outlook, or the refresh fails (e.g. they revoked consent).
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({ where: { userId, provider: PROVIDER } });
  if (!account?.access_token) return null;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at > nowSeconds + 60) {
    return account.access_token;
  }
  if (!account.refresh_token) return account.access_token;

  const tenant = process.env.AZURE_AD_TENANT_ID || "common";
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID ?? "",
      client_secret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: json.access_token,
      refresh_token: json.refresh_token ?? account.refresh_token,
      expires_at: nowSeconds + json.expires_in,
    },
  });

  return json.access_token;
}

export async function isOutlookConnected(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: PROVIDER },
    select: { refresh_token: true },
  });
  return Boolean(account?.refresh_token);
}
