import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const newBusiness = await prisma.opportunityType.upsert({
    where: { name: "New Business" },
    update: {},
    create: {
      name: "New Business",
      description: "Net-new deals with prospective customers",
      stages: [
        { key: "qualification", label: "Qualification", order: 0, probability: 10, isWon: false, isLost: false },
        { key: "needs-analysis", label: "Needs Analysis", order: 1, probability: 25, isWon: false, isLost: false },
        { key: "proposal", label: "Proposal", order: 2, probability: 50, isWon: false, isLost: false },
        { key: "negotiation", label: "Negotiation", order: 3, probability: 75, isWon: false, isLost: false },
        { key: "closed-won", label: "Closed Won", order: 4, probability: 100, isWon: true, isLost: false },
        { key: "closed-lost", label: "Closed Lost", order: 5, probability: 0, isWon: false, isLost: true },
      ],
    },
  });

  const renewal = await prisma.opportunityType.upsert({
    where: { name: "Renewal" },
    update: {},
    create: {
      name: "Renewal",
      description: "Existing customer contract renewals",
      stages: [
        { key: "renewal-review", label: "Renewal Review", order: 0, probability: 20, isWon: false, isLost: false },
        { key: "proposal-sent", label: "Proposal Sent", order: 1, probability: 60, isWon: false, isLost: false },
        { key: "contract-signed", label: "Contract Signed", order: 2, probability: 90, isWon: false, isLost: false },
        { key: "renewed", label: "Renewed", order: 3, probability: 100, isWon: true, isLost: false },
        { key: "churned", label: "Churned", order: 4, probability: 0, isWon: false, isLost: true },
      ],
    },
  });

  await prisma.opportunityType.upsert({
    where: { name: "Upsell / Expansion" },
    update: {},
    create: {
      name: "Upsell / Expansion",
      description: "Additional seats, products, or services for existing customers",
      stages: [
        { key: "needs-identified", label: "Needs Identified", order: 0, probability: 20, isWon: false, isLost: false },
        { key: "expansion-proposal", label: "Expansion Proposal", order: 1, probability: 55, isWon: false, isLost: false },
        { key: "closed-won", label: "Closed Won", order: 2, probability: 100, isWon: true, isLost: false },
        { key: "closed-lost", label: "Closed Lost", order: 3, probability: 0, isWon: false, isLost: true },
      ],
    },
  });

  await prisma.customFieldDefinition.upsert({
    where: { entityType_fieldKey: { entityType: "OPPORTUNITY", fieldKey: "contract_number" } },
    update: {},
    create: {
      entityType: "OPPORTUNITY",
      fieldKey: "contract_number",
      label: "Contract Number",
      fieldType: "TEXT",
      order: 0,
    },
  });

  await prisma.customFieldDefinition.upsert({
    where: { entityType_fieldKey: { entityType: "CONTACT", fieldKey: "preferred_contact_method" } },
    update: {},
    create: {
      entityType: "CONTACT",
      fieldKey: "preferred_contact_method",
      label: "Preferred Contact Method",
      fieldType: "DROPDOWN",
      options: ["Email", "Phone", "Text"],
      order: 0,
    },
  });

  await prisma.customFieldDefinition.upsert({
    where: { entityType_fieldKey: { entityType: "LEAD", fieldKey: "referral_source_detail" } },
    update: {},
    create: {
      entityType: "LEAD",
      fieldKey: "referral_source_detail",
      label: "Referral Source Detail",
      fieldType: "TEXT",
      order: 0,
    },
  });

  const acme = await prisma.company.upsert({
    where: { id: "seed-company-acme" },
    update: {},
    create: {
      id: "seed-company-acme",
      name: "Acme Manufacturing",
      industry: "Manufacturing",
      website: "https://acme.example.com",
      phone: "555-010-0100",
      city: "Columbus",
      state: "OH",
      country: "USA",
    },
  });

  const globex = await prisma.company.upsert({
    where: { id: "seed-company-globex" },
    update: {},
    create: {
      id: "seed-company-globex",
      name: "Globex Logistics",
      industry: "Transportation",
      website: "https://globex.example.com",
      phone: "555-010-0200",
      city: "Denver",
      state: "CO",
      country: "USA",
    },
  });

  const janeContact = await prisma.contact.upsert({
    where: { id: "seed-contact-jane" },
    update: {},
    create: {
      id: "seed-contact-jane",
      firstName: "Jane",
      lastName: "Whitfield",
      email: "jane.whitfield@acme.example.com",
      phone: "555-010-0101",
      title: "VP Operations",
      companyId: acme.id,
    },
  });

  await prisma.contact.upsert({
    where: { id: "seed-contact-mark" },
    update: {},
    create: {
      id: "seed-contact-mark",
      firstName: "Mark",
      lastName: "Delgado",
      email: "mark.delgado@globex.example.com",
      phone: "555-010-0201",
      title: "Director of Procurement",
      companyId: globex.id,
    },
  });

  await prisma.lead.upsert({
    where: { id: "seed-lead-priya" },
    update: {},
    create: {
      id: "seed-lead-priya",
      firstName: "Priya",
      lastName: "Nair",
      companyName: "Nair Consulting",
      email: "priya.nair@example.com",
      phone: "555-010-0300",
      source: "Website",
      status: "NEW",
      rating: "HOT",
    },
  });

  await prisma.lead.upsert({
    where: { id: "seed-lead-tom" },
    update: {},
    create: {
      id: "seed-lead-tom",
      firstName: "Tom",
      lastName: "Reyes",
      companyName: "Reyes Retail Group",
      email: "tom.reyes@example.com",
      source: "Referral",
      status: "CONTACTED",
      rating: "WARM",
    },
  });

  const opp1 = await prisma.opportunity.upsert({
    where: { id: "seed-opp-acme-expansion" },
    update: {},
    create: {
      id: "seed-opp-acme-expansion",
      name: "Acme - Plant Floor Rollout",
      opportunityTypeId: newBusiness.id,
      stage: "proposal",
      probability: 50,
      amount: 84000,
      companyId: acme.id,
      contactId: janeContact.id,
    },
  });

  await prisma.opportunity.upsert({
    where: { id: "seed-opp-globex-renewal" },
    update: {},
    create: {
      id: "seed-opp-globex-renewal",
      name: "Globex - Annual Renewal",
      opportunityTypeId: renewal.id,
      stage: "renewal-review",
      probability: 20,
      amount: 32000,
      companyId: globex.id,
    },
  });

  await prisma.task.upsert({
    where: { id: "seed-task-followup-jane" },
    update: {},
    create: {
      id: "seed-task-followup-jane",
      subject: "Follow up with Jane on rollout proposal",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "OPEN",
      priority: "HIGH",
      relatedType: "OPPORTUNITY",
      opportunityId: opp1.id,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
