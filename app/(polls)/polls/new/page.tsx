import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";

export default function NewPollPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a new poll</CardTitle>
          <CardDescription>Define your question and options.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="question" className="text-sm font-medium">Question</label>
              <Input id="question" placeholder="What should we decide?" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="option1" className="text-sm font-medium">Option 1</label>
              <Input id="option1" placeholder="First option" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="option2" className="text-sm font-medium">Option 2</label>
              <Input id="option2" placeholder="Second option" />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


