import { signIn, devLoginEnabled } from "@/auth";
import { Building2 } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Building2 size={24} />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Victor Sierra CRM
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in with your Victor Sierra Microsoft 365 account
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", { redirectTo: callbackUrl || "/" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <MicrosoftLogo />
            Sign in with Microsoft
          </button>
        </form>

        {devLoginEnabled && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              dev login (no Azure AD needed)
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <form
              action={async (formData) => {
                "use server";
                await signIn("dev-login", {
                  email: formData.get("email"),
                  name: formData.get("name"),
                  redirectTo: callbackUrl || "/",
                });
              }}
              className="space-y-2"
            >
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                name="name"
                type="text"
                placeholder="Display name (optional)"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
              />
              <button
                type="submit"
                className="w-full rounded-md border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Continue as this user
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}
