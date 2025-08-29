import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function requireNumeric(raw: string | number, field: string): number | null {
  if (typeof raw === "number") return raw;
  if (/^\d+$/.test(raw)) return Number(raw);
  return null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const h = await headers();
  const authHeader = h.get("authorization") || undefined;
  const supabase = createServerSupabaseClient(authHeader);

  // ✅ Require auth
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Parse body
  let body: { item_id?: string | number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const itemId = requireNumeric(body.item_id ?? "", "item_id");
  if (itemId === null) {
    return NextResponse.json({ error: "'item_id' must be a number" }, { status: 422 });
  }

  // ✅ Validate poll id
  const pollId = requireNumeric(params.id, "poll_id");
  if (pollId === null) {
    return NextResponse.json({ error: "'poll_id' must be a number" }, { status: 422 });
  }

  // ✅ Check poll exists
  const { data: poll, error: pollErr } = await supabase
    .from("polls")
    .select("id, created_by")
    .eq("id", pollId)
    .single();
  if (pollErr || !poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  // ✅ Ensure item belongs to poll
  const { data: item, error: itemErr } = await supabase
    .from("poll_items")
    .select("id, poll_id")
    .eq("id", itemId)
    .single();
  if (itemErr || !item || Number(item.poll_id) !== pollId) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }

  // ✅ One vote per user per poll
  await supabase
    .from("votes")
    .delete()
    .eq("poll_id", pollId)
    .eq("voter_id", userData.user.id); // voter_id must be UUID type in DB

  // ✅ Insert new vote
  const { data: vote, error: voteErr } = await supabase
    .from("votes")
    .insert({
      poll_id: pollId,
      item_id: itemId,
      voter_id: userData.user.id, // still UUID
    })
    .select("*")
    .single();

  if (voteErr) {
    return NextResponse.json({ error: voteErr.message }, { status: 500 });
  }

  return NextResponse.json({ vote }, { status: 201 });
}
