"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import ShareQRCode from "@/components/ShareQRCode";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function PollDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [pollTitle, setPollTitle] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [owner, setOwner] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: sessionData }, itemsRes, pollRes] = await Promise.all([
        supabase.auth.getSession(),
        fetch(`/api/polls/${id}/items`, { cache: "no-store" }),
        fetch(`/api/polls/${id}`, { cache: "no-store" }),
      ]);
      const token = sessionData.session?.access_token;
      const itemsJson = itemsRes.ok ? await itemsRes.json() : { items: [] };
      setItems(itemsJson.items || []);
      const pollJson = pollRes.ok ? await pollRes.json() : { poll: null };
      if (pollJson.poll) {
        setPollTitle(pollJson.poll.question ?? "");
        if (sessionData.session?.user) {
          setOwner(pollJson.poll.created_by === sessionData.session.user.id);
        }
      }
    };
    load();
  }, [id, supabase]);
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>{pollTitle || `Poll #${id}`}</CardTitle>
          <CardDescription>Choose your option and submit your vote.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {items.map((opt) => (
              <label key={opt.id} className="flex items-center gap-3 rounded-md border border-[color:var(--border)] px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedItem === opt.id}
                  onChange={() => setSelectedItem(selectedItem === opt.id ? null : opt.id)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <Button
            className="mt-4"
            disabled={!selectedItem || saving}
            onClick={async () => {
              if (!selectedItem) return;
              setSaving(true);
              setError(null);
              const { data: sessionData } = await supabase.auth.getSession();
              const token = sessionData.session?.access_token;
              const res = await fetch(`/api/polls/${id}/vote`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ item_id: selectedItem }),
              });
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body.error || "Failed to vote");
              } else {
                alert("Vote submitted");
              }
              setSaving(false);
            }}
          >
            {saving ? "Submitting..." : "Submit vote"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="pt-6 border-t border-[color:var(--border)]">
            <h3 className="text-sm font-medium mb-3">Share this poll</h3>
            <ShareQRCode url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/polls/${id}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


