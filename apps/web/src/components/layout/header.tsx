"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Crown, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserBadges } from "@/components/badge/user-badge";

const navigation = [
  { name: "홈", href: "/" },
  { name: "입법예정법안", href: "/bills" },
  { name: "국민동의청원", href: "/petitions" },
  { name: "실시간토론", href: "/live", icon: "live" },
  { name: "정치관련통계", href: "/stats" },
  { name: "커뮤니티", href: "/community" },
  { name: "정치인", href: "/politicians" },
  { name: "뱃지", href: "/badge", icon: "badge" },
];

async function fetchUserBadges() {
  const res = await fetch("/api/user/badges");
  if (!res.ok) return [];
  return res.json();
}

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const { data: badges = [] } = useQuery({
    queryKey: ["user-badges"],
    queryFn: fetchUserBadges,
    enabled: !!session,
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-8">
        <Link href="/" className="mr-8 flex items-center space-x-2 transition-transform hover:scale-105">
          <span className="text-xl font-black bg-gradient-to-tr from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            POLITICS.KR
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80 px-1 py-2 flex items-center gap-1",
                pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                  ? "text-foreground font-semibold"
                  : "text-foreground/60 font-medium"
              )}
            >
              {item.icon === "live" && <Radio className="h-4 w-4 text-red-500 animate-pulse" />}
              {item.icon === "badge" && <Crown className="h-4 w-4" />}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link href="/badge" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || ""}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8 rounded-full bg-muted p-1.5" />
                )}
                <span className="text-sm font-medium">{session.user?.name}</span>
                {badges.length > 0 && (
                  <UserBadges badges={badges} size="sm" maxDisplay={2} />
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
