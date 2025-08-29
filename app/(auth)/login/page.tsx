import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-20">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your account to create and vote in polls.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            Don&apos;t have an account? <Link className="underline" href="/register">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


