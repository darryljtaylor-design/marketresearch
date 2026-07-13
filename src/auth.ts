import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";

export const devLoginEnabled = process.env.ENABLE_DEV_LOGIN === "true";

// Dev-only bypass so the app can be run and clicked through without an Azure
// AD app registration. Never enable ENABLE_DEV_LOGIN in a real deployment -
// it signs in as whatever email you type, no password.
const devLoginProvider = Credentials({
  id: "dev-login",
  name: "Dev Login",
  credentials: {
    email: { label: "Email", type: "email" },
    name: { label: "Name", type: "text" },
  },
  async authorize(credentials) {
    const email = credentials?.email?.toString().trim().toLowerCase();
    if (!email) return null;
    const name = credentials?.name?.toString().trim() || email.split("@")[0];

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, role: "ADMIN" },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [...authConfig.providers, ...(devLoginEnabled ? [devLoginProvider] : [])],
  adapter: PrismaAdapter(prisma),
});
