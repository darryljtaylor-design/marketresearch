import { Client } from "@microsoft/microsoft-graph-client";
import { getValidAccessToken } from "@/lib/graph/token";

// Returns a Graph client authenticated as the given CRM user, or null if
// they haven't connected Outlook / their token can't be refreshed.
export async function getGraphClientForUser(userId: string): Promise<Client | null> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return null;

  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
}
