import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const [leads, contacts, companies, opportunities] = await Promise.all([
    prisma.lead.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { companyName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.company.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
    prisma.opportunity.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
  ]);

  const results = [
    ...leads.map((l) => ({
      type: "Lead",
      id: l.id,
      label: `${l.firstName} ${l.lastName}`,
      sublabel: l.companyName ?? l.email ?? "",
      href: `/leads/${l.id}`,
    })),
    ...contacts.map((c) => ({
      type: "Contact",
      id: c.id,
      label: `${c.firstName} ${c.lastName}`,
      sublabel: c.email ?? "",
      href: `/contacts/${c.id}`,
    })),
    ...companies.map((co) => ({
      type: "Customer",
      id: co.id,
      label: co.name,
      sublabel: co.industry ?? "",
      href: `/companies/${co.id}`,
    })),
    ...opportunities.map((o) => ({
      type: "Opportunity",
      id: o.id,
      label: o.name,
      sublabel: o.stage,
      href: `/opportunities/${o.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
