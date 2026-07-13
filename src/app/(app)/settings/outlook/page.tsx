import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isOutlookConnected } from "@/lib/graph/token";
import { syncNow, reconnectOutlook } from "@/app/(app)/settings/outlook/actions";

export default async function OutlookSettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [connected, syncState, emailCount] = await Promise.all([
    isOutlookConnected(userId),
    prisma.syncState.findUnique({ where: { userId } }),
    prisma.emailMessage.count({ where: { mailboxUserId: userId } }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Outlook integration</h1>
        <p className="text-sm text-slate-500">
          Automatically pull emails from your Outlook inbox and sync CRM follow-up tasks to your
          Outlook calendar.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="font-medium text-slate-900 dark:text-white">Connected</span>
            </>
          ) : (
            <>
              <XCircle size={18} className="text-red-500" />
              <span className="font-medium text-slate-900 dark:text-white">Not connected</span>
            </>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {connected
            ? "Signed in with Microsoft, with permission to read mail and manage your calendar."
            : "We couldn't get calendar/mail permissions from your Microsoft sign-in. Reconnect below."}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase text-slate-400">Last synced</dt>
            <dd className="text-slate-700 dark:text-slate-200">
              {syncState?.lastSyncedAt
                ? formatDistanceToNow(syncState.lastSyncedAt, { addSuffix: true })
                : "Never"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Emails synced</dt>
            <dd className="text-slate-700 dark:text-slate-200">{emailCount}</dd>
          </div>
        </dl>

        <div className="mt-5 flex gap-2">
          {connected ? (
            <form action={syncNow}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <RefreshCw size={14} /> Sync now
              </button>
            </form>
          ) : null}
          <form action={reconnectOutlook}>
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {connected ? "Reconnect" : "Connect Outlook"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
        <p>
          For automatic background syncing (so email keeps flowing in even when nobody has the
          CRM open), point a scheduler at{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
            /api/cron/sync-outlook
          </code>{" "}
          every 5-15 minutes, and{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
            /api/cron/check-tasks
          </code>{" "}
          every few minutes for task reminders. See the README for setup options (Vercel Cron,
          Azure, GitHub Actions, or plain cron+curl).
        </p>
      </div>
    </div>
  );
}
