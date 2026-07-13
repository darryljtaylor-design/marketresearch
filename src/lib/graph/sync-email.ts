import { prisma } from "@/lib/prisma";
import { getGraphClientForUser } from "@/lib/graph/client";

type GraphMessage = {
  id: string;
  subject?: string;
  receivedDateTime: string;
  bodyPreview?: string;
  from?: { emailAddress?: { address?: string; name?: string } };
  toRecipients?: { emailAddress?: { address?: string } }[];
  "@removed"?: unknown;
};

const SELECT_FIELDS = "subject,from,toRecipients,receivedDateTime,bodyPreview";

export async function syncOutlookEmailsForUser(userId: string) {
  const client = await getGraphClientForUser(userId);
  if (!client) return { synced: 0, connected: false };

  const [user, syncState] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } }),
    prisma.syncState.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
  ]);

  const [leads, contacts] = await Promise.all([
    prisma.lead.findMany({ where: { email: { not: null } }, select: { id: true, email: true } }),
    prisma.contact.findMany({ where: { email: { not: null } }, select: { id: true, email: true, companyId: true } }),
  ]);

  const leadByEmail = new Map(leads.map((l) => [l.email!.toLowerCase(), l.id]));
  const contactByEmail = new Map(
    contacts.map((c) => [c.email!.toLowerCase(), { id: c.id, companyId: c.companyId }])
  );

  let url = syncState.mailDeltaLink
    ? syncState.mailDeltaLink
    : `/me/mailFolders/inbox/messages/delta?$select=${SELECT_FIELDS}`;

  let synced = 0;
  let deltaLink: string | null = null;
  const ownEmail = user.email?.toLowerCase();

  // Follow @odata.nextLink pages until Graph returns @odata.deltaLink,
  // which marks the end of this sync batch and is saved as the cursor
  // for next time (so we only ever fetch what's new).
  while (url) {
    const page: {
      value: GraphMessage[];
      "@odata.nextLink"?: string;
      "@odata.deltaLink"?: string;
    } = await client.api(url).get();

    for (const msg of page.value) {
      if (msg["@removed"]) continue;

      const fromAddress = msg.from?.emailAddress?.address?.toLowerCase();
      const toAddresses = (msg.toRecipients ?? [])
        .map((r) => r.emailAddress?.address)
        .filter((a): a is string => Boolean(a));

      const counterpartAddress =
        fromAddress && fromAddress !== ownEmail ? fromAddress : toAddresses[0]?.toLowerCase();

      const lead = counterpartAddress ? leadByEmail.get(counterpartAddress) : undefined;
      const contact = counterpartAddress ? contactByEmail.get(counterpartAddress) : undefined;

      if (!lead && !contact) continue; // don't store noise we can't tie to a CRM record

      await prisma.emailMessage.upsert({
        where: { graphMessageId: msg.id },
        create: {
          graphMessageId: msg.id,
          subject: msg.subject,
          fromAddress: msg.from?.emailAddress?.address,
          fromName: msg.from?.emailAddress?.name,
          toAddresses,
          direction: fromAddress === ownEmail ? "OUTBOUND" : "INBOUND",
          bodyPreview: msg.bodyPreview,
          receivedAt: new Date(msg.receivedDateTime),
          mailboxUserId: userId,
          leadId: lead,
          contactId: contact?.id,
          companyId: contact?.companyId ?? undefined,
        },
        update: {},
      });
      synced++;
    }

    if (page["@odata.deltaLink"]) {
      deltaLink = page["@odata.deltaLink"];
      url = "";
    } else if (page["@odata.nextLink"]) {
      url = page["@odata.nextLink"];
    } else {
      url = "";
    }
  }

  await prisma.syncState.update({
    where: { userId },
    data: { lastSyncedAt: new Date(), mailDeltaLink: deltaLink ?? syncState.mailDeltaLink },
  });

  return { synced, connected: true };
}
