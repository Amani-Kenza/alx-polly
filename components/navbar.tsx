"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase-client";

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
        pathname === href
          ? "bg-[color:var(--muted)] text-[color:var(--foreground)]"
          : "text-gray-600 hover:text-[color:var(--foreground)] hover:bg-[color:var(--muted)]"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base font-semibold text-[color:var(--foreground)]">
            Polly
          </Link>
          <nav className="hidden gap-2 md:flex">
            <NavLink href="/polls" label="Polls" />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 rounded-full bg-[color:var(--muted)] px-3 py-1.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--primary)] text-[color:var(--primary-foreground)] text-xs font-semibold">
                  {(user.user_metadata.full_name || user.email || "U").toString().slice(0,1).toUpperCase()}
                </span>
                <span className="text-sm text-[color:var(--muted-foreground)]">
                  {user.user_metadata.full_name || user.email}
                </span>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


