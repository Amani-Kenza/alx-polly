"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function NewPollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Attach bearer token so RLS sees the authenticated user
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const createPollRes = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          question: question.trim(),
          options: [option1.trim(), option2.trim()].filter(Boolean),
        })
      });
      if (!createPollRes.ok) {
        const body = await createPollRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create poll");
      }
      const { poll } = await createPollRes.json();

      router.push(`/polls?created=1`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a new poll</CardTitle>
            <CardDescription>Define your question and options.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label htmlFor="question" className="text-sm font-medium">
                  Question
                </label>
                <Input
                  id="question"
                  placeholder="What should we decide?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
                <p className="text-xs text-[color:var(--muted-foreground)]">Be concise and clear.</p>
              </div>
              <div className="grid gap-2">
                <label htmlFor="option1" className="text-sm font-medium">
                  Option 1
                </label>
                <Input
                  id="option1"
                  placeholder="First option"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="option2" className="text-sm font-medium">
                  Option 2
                </label>
                <Input
                  id="option2"
                  placeholder="Second option"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                />
                <p className="text-xs text-[color:var(--muted-foreground)]">Add more options after creating the poll.</p>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}


