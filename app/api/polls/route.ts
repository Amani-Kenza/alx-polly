import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { headers } from "next/headers";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("polls").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ polls: data ?? [] });
}

export async function POST(request: Request) {
  const h = await headers();
  const authHeader = h.get("authorization") || undefined;
  const supabase = createServerSupabaseClient(authHeader);
  // Resolve current user from the provided bearer token
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let payload: { question?: string; description?: string | null; options?: string[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = (payload.question ?? "").trim();
  const description = payload.description ?? null;
  if (!question) {
    return NextResponse.json({ error: "'question' is required" }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("polls")
    .insert({ question, description, created_by: userData.user.id })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const poll = data;

  const optionLabels = Array.isArray(payload.options)
    ? payload.options
        .map((o) => (typeof o === "string" ? o.trim() : ""))
        .filter((o) => o.length > 0)
    : [];

  if (optionLabels.length > 0) {
    const itemsToInsert = optionLabels.map((label) => ({ poll_id: poll.id, label }));
    const { error: itemsErr } = await supabase.from("poll_items").insert(itemsToInsert);
    if (itemsErr) {
      return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ poll }, { status: 201 });
}


