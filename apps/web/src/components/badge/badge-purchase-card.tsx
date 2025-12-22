"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BADGE_PRICES } from "@/lib/constants";

interface BadgePurchaseCardProps {
  type: "SUPPORTER" | "POLITICIAN_FAN";
  politicianId?: string;
  politicianName?: string;
  politicianParty?: string;
  isOwned?: boolean;
}

export function BadgePurchaseCard({
  type,
  politicianId,
  politicianName,
  politicianParty,
  isOwned = false,
}: BadgePurchaseCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isSupporter = type === "SUPPORTER";
  const price = isSupporter ? BADGE_PRICES.SUPPORTER : BADGE_PRICES.POLITICIAN_FAN;

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          badgeType: type,
          politicianId: politicianId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "결제 세션 생성 실패");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error instanceof Error ? error.message : "결제 처리 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg",
      isOwned && "ring-2 ring-primary"
    )}>
      {isOwned && (
        <div className="absolute top-3 right-3">
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" />
            보유중
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <div className={cn(
          "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full",
          isSupporter ? "bg-blue-100 dark:bg-blue-900" : "bg-pink-100 dark:bg-pink-900"
        )}>
          {isSupporter ? (
            <Star className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          ) : (
            <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
          )}
        </div>
        <CardTitle className="text-xl">
          {isSupporter ? "서포터 뱃지" : `${politicianName} 팬 뱃지`}
        </CardTitle>
        <CardDescription>
          {isSupporter 
            ? "Politics.kr를 응원해주세요!"
            : `${politicianName}님을 응원하는 뱃지입니다`}
        </CardDescription>
        {politicianParty && (
          <Badge variant="outline" className="mt-2">
            {politicianParty}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <div>
          <span className="text-3xl font-bold">{price.toLocaleString()}</span>
          <span className="text-muted-foreground">원/월</span>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            닉네임 옆 뱃지 표시
          </li>
          <li className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            커뮤니티 활동 시 뱃지 노출
          </li>
          <li className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            30일간 유효
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={handlePurchase}
          disabled={isLoading || isOwned}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : isOwned ? (
            "이미 보유 중"
          ) : (
            "구매하기"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

