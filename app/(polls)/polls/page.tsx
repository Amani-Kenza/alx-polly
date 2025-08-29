import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function PollsListPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Polls</h1>
        <Button asChild>
          <Link href="/polls/new">New poll</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((id) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle>Sample poll #{id}</CardTitle>
              <CardDescription>Short description of the poll.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href={`/polls/${id}`}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


