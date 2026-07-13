import { format } from "date-fns";
import { Mail } from "lucide-react";
import { Badge } from "@/components/badge";

type EmailItem = {
  id: string;
  subject: string | null;
  fromName: string | null;
  fromAddress: string | null;
  bodyPreview: string | null;
  direction: string;
  receivedAt: Date;
};

export function EmailsPanel({ emails }: { emails: EmailItem[] }) {
  if (emails.length === 0) {
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-slate-400">
        <Mail size={16} /> No synced emails yet. Connect Outlook in Settings to pull email history
        in automatically.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {emails.map((e) => (
        <li key={e.id} className="py-2.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-slate-800 dark:text-slate-100">
              {e.subject || "(no subject)"}
            </span>
            <Badge color={e.direction === "INBOUND" ? "blue" : "emerald"}>
              {e.direction === "INBOUND" ? "Received" : "Sent"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            {e.fromName || e.fromAddress} · {format(e.receivedAt, "MMM d, yyyy h:mm a")}
          </p>
          {e.bodyPreview && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{e.bodyPreview}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
