import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { headers } from "next/headers";

// ✅ GET all poll items for a poll (by poll UUID)
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { id } = params; // UUID string directly

  const { data, error } = await supabase
    .from("poll_items")
    .select("*")
    .eq("poll_id", id) // ✅ works with UUID
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

// ✅ POST a new poll item to a poll (by poll UUID)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const h = await headers();
  const authHeader = h.get("authorization") || undefined;
  const supabase = createServerSupabaseClient(authHeader);

  let payload: { label?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const label = (payload.label ?? "").trim();
  if (!label) {
    return NextResponse.json({ error: "'label' is required" }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("poll_items")
    .insert({ poll_id: params.id, label }) // ✅ poll_id is UUID
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
