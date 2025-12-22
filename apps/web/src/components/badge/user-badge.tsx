"use client";

import { Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserBadgeProps {
  type: "SUPPORTER" | "POLITICIAN_FAN";
  politicianName?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function UserBadge({
  type,
  politicianName,
  size = "sm",
  showLabel = false,
  className,
}: UserBadgeProps) {
  const isSupporter = type === "SUPPORTER";

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const containerClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-2.5 py-1.5 text-base",
  };

  const Icon = isSupporter ? Star : Heart;
  const iconColor = isSupporter ? "text-blue-500" : "text-pink-500";
  const bgColor = isSupporter 
    ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" 
    : "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800";

  if (!showLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          bgColor,
          "border",
          className
        )}
        title={isSupporter ? "서포터" : `${politicianName} 팬`}
        style={{ padding: "2px" }}
      >
        <Icon className={cn(sizeClasses[size], iconColor, "fill-current")} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        bgColor,
        containerClasses[size],
        className
      )}
    >
      <Icon className={cn(sizeClasses[size], iconColor, "fill-current")} />
      <span className={isSupporter ? "text-blue-700 dark:text-blue-300" : "text-pink-700 dark:text-pink-300"}>
        {isSupporter ? "서포터" : `${politicianName} 팬`}
      </span>
    </span>
  );
}

// 여러 뱃지를 표시할 때 사용
interface UserBadgesProps {
  badges: Array<{
    badgeType: "SUPPORTER" | "POLITICIAN_FAN";
    politician?: { name: string } | null;
  }>;
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
  className?: string;
}

export function UserBadges({
  badges,
  size = "sm",
  maxDisplay = 3,
  className,
}: UserBadgesProps) {
  if (!badges || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {displayBadges.map((badge, index) => (
        <UserBadge
          key={index}
          type={badge.badgeType}
          politicianName={badge.politician?.name}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining}</span>
      )}
    </span>
  );
}

