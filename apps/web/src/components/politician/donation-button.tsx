"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { DonationModal } from "./donation-modal";

interface DonationButtonProps {
  politicianId: string;
  politicianName: string;
  politicianParty?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function DonationButton({
  politicianId,
  politicianName,
  politicianParty,
  variant = "default",
  size = "default",
  className,
}: DonationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Heart className="mr-2 h-4 w-4" />
        후원하기
      </Button>
      
      <DonationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        politicianId={politicianId}
        politicianName={politicianName}
        politicianParty={politicianParty}
      />
    </>
  );
}

