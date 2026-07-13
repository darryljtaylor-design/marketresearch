import { formatDistanceToNow } from "date-fns";

type NoteItem = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string | null } | null;
};

export function NotesPanel({
  notes,
  action,
}: {
  notes: NoteItem[];
  action: (formData: FormData) => void;
}) {
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-2">
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Add a note..."
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add note
          </button>
        </div>
      </form>
      <ul className="space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{n.body}</p>
            <p className="mt-1.5 text-xs text-slate-400">
              {n.author?.name ?? "Someone"} · {formatDistanceToNow(n.createdAt, { addSuffix: true })}
            </p>
          </li>
        ))}
        {notes.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400">No notes yet.</p>
        )}
      </ul>
    </div>
  );
}
