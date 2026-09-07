import { getD1 } from "@/db";
import { getAuthenticatedUser } from "@/app/lib/supabase-auth";
import { loadTutorMemory } from "@/app/lib/tutor-memory";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: "Sign in to view your practice profile." }, { status: 401 });
  const level = new URL(request.url).searchParams.get("level") ?? "A2";
  if (!["A1", "A2", "B1"].includes(level)) return Response.json({ error: "Unknown level." }, { status: 400 });
  return Response.json({ ...await loadTutorMemory(await getD1(), user.id, level), userId: user.id }, { headers: { "cache-control": "no-store" } });
}
