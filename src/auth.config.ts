import type { NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// Scopes needed beyond sign-in so we can later read/send mail and sync
// calendar events on the user's behalf via Microsoft Graph.
const GRAPH_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "User.Read",
  "Mail.Read",
  "Mail.Send",
  "Calendars.ReadWrite",
].join(" ");

// Edge-safe config (no Prisma adapter here) so it can be reused by
// middleware, which runs in a runtime that can't load the Node-only
// Prisma client. See src/auth.ts for the full server-side config.
export default {
  trustHost: true,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: process.env.AZURE_AD_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`
        : undefined,
      authorization: { params: { scope: GRAPH_SCOPES, prompt: "select_account" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
