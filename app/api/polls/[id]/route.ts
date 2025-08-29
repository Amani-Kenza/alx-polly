import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function requireNumeric(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabaseClient();
  const { id } = await params;
  const idValue = requireNumeric(id);
  if (idValue === null) return NextResponse.json({ error: "Invalid poll id" }, { status: 400 });
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", idValue as any)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ poll: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const h = await headers();
  const authHeader = h.get("authorization") || undefined;
  const supabase = createServerSupabaseClient(authHeader);
  let payload: { question?: string; description?: string | null };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof payload.question === "string") updates.question = payload.question.trim();
  if (typeof payload.description !== "undefined") updates.description = payload.description;

  const { id } = await params;
  const idValue = requireNumeric(id);
  if (idValue === null) return NextResponse.json({ error: "Invalid poll id" }, { status: 400 });
  const { data, error } = await supabase
    .from("polls")
    .update(updates)
    .eq("id", idValue as any)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ poll: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const h = await headers();
  const authHeader = h.get("authorization") || undefined;
  const supabase = createServerSupabaseClient(authHeader);
  const { id } = await params;
  const idValue = requireNumeric(id);
  if (idValue === null) return NextResponse.json({ error: "Invalid poll id" }, { status: 400 });
  const { error } = await supabase.from("polls").delete().eq("id", idValue as any);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


