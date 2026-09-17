import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { getD1 } from "@/db";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401, headers });

  try {
    const db = await getD1();
    // A D1 batch provides a consistent snapshot. All ownership comes from the
    // verified token, never query parameters or client-supplied headers.
    const results = await db.batch([
      db.prepare("SELECT id, email, username, display_name, created_at, updated_at FROM users WHERE id = ?").bind(user.id),
      db.prepare("SELECT scope, data, updated_at FROM user_progress WHERE user_id = ? ORDER BY scope").bind(user.id),
      db.prepare("SELECT task_id, data, version, updated_at FROM tutor_sessions WHERE user_id = ? ORDER BY task_id").bind(user.id),
      db.prepare("SELECT day, used FROM tutor_quotas WHERE user_id = ? ORDER BY day").bind(user.id),
    ]);
    if (results.some((result) => !result.success)) throw new Error("Export query failed");
    return Response.json({
      format: "leselaut-account-export",
      version: 1,
      exportedAt: new Date().toISOString(),
      userId: user.id,
      coverage: "Server-saved LeseLaut data only. Unsynced browser drafts, original photos/audio, passwords and Supabase authentication records are not included. JSON data columns are preserved as strings. This file contains private learning history.",
      account: results[0].results[0] ?? null,
      progress: results[1].results,
      tutorSessions: results[2].results,
      tutorQuotas: results[3].results,
    }, { headers: { ...headers, "Content-Disposition": 'attachment; filename="leselaut-account-data.json"' } });
  } catch {
    // Deliberately exclude tokens, learner text, SQL errors and account IDs.
    console.error(JSON.stringify({ event: "account_export_failed" }));
    return Response.json({ error: "Your data could not be exported. Please try again." }, { status: 503, headers });
  }
}
