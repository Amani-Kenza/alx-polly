"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function PollsListPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const created = searchParams.get("created") === "1";
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const load = async () => {
      try {
        const res = await fetch("/api/polls", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load polls");
        const data = await res.json();
        setPolls(data.polls || []);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

  const dismissBanner = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("created");
    router.replace(`/polls${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Polls</h1>
          <p className="text-sm text-[color:var(--muted-foreground)]">Browse and vote on recent polls.</p>
        </div>
        <Button asChild>
          <Link href="/polls/new">New poll</Link>
        </Button>
      </div>

      {created && (
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[color:var(--foreground)] flex items-start justify-between gap-3">
          <div>
            <span className="font-medium">Success:</span> Poll created successfully.
          </div>
          <button onClick={dismissBanner} className="text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]">Dismiss</button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : polls.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No polls yet</CardTitle>
            <CardDescription>Be the first to create one.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {polls.map((poll) => (
            <Card key={poll.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{poll.question}</CardTitle>
                    {poll.description ? (
                      <CardDescription>{poll.description}</CardDescription>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-[color:var(--muted)] px-2.5 py-1 text-xs text-[color:var(--muted-foreground)]">Open</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[color:var(--muted-foreground)]">
                    <span>Created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/polls/${poll.id}`}>View</Link>
                    </Button>
                  
                       <Button asChild>
                       <Link href={`/polls/${poll.id}`}>Vote</Link>
                     </Button>
                       
                        <Button variant="outline" onClick={() => router.push(`/polls/${poll.id}`)}>Edit</Button>
                        <Button
                          variant="outline" asChild={false}
                          onClick={async () => {
                            const { data: sessionData } = await supabase.auth.getSession();
                            const token = sessionData.session?.access_token;
                            const res = await fetch(`/api/polls/${poll.id}`, {
                              method: "DELETE",
                              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                            });
                            if (res.ok) {
                              setPolls((prev) => prev.filter((p) => p.id !== poll.id));
                            }
                          }}
                        >
                          Delete
                        </Button>
                
                     
                   
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


