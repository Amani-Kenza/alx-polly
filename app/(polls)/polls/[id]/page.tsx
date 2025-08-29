import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

interface PollPageProps {
  params: { id: string };
}

export default function PollDetailPage({ params }: PollPageProps) {
  const { id } = params;
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Poll #{id}</CardTitle>
          <CardDescription>Choose your option and submit your vote.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Option A", "Option B", "Option C"].map((opt) => (
            <Button key={opt} variant="outline" className="w-full justify-start">
              {opt}
            </Button>
          ))}
          <Button className="mt-4">Submit vote</Button>
        </CardContent>
      </Card>
    </div>
  );
}


