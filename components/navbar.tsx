"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 text-sm font-medium",
        pathname === href ? "text-black" : "text-gray-600 hover:text-black"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold">Polly</Link>
          <nav className="hidden gap-2 md:flex">
            <NavLink href="/polls" label="Polls" />
            <NavLink href="/polls/new" label="Create" />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}


