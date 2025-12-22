"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Mail, Bell, CheckCircle2, AlertCircle, Construction } from "lucide-react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  politicianId: string;
  politicianName: string;
  politicianParty?: string;
}

const PRESET_AMOUNTS = [
  { value: 10000, label: "1만원" },
  { value: 30000, label: "3만원" },
  { value: 50000, label: "5만원" },
  { value: 100000, label: "10만원" },
];

export function DonationModal({
  isOpen,
  onClose,
  politicianId,
  politicianName,
  politicianParty,
}: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, "");
    setCustomAmount(numValue);
    setSelectedAmount(null);
  };

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleNotifySubscribe = () => {
    if (!email) return;
    // TODO: 이메일 구독 API 호출
    setIsSubscribed(true);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setEmail("");
    setIsSubscribed(false);
    setShowSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            {politicianName} 후원하기
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {politicianParty && (
              <Badge variant="outline">{politicianParty}</Badge>
            )}
            정치인에게 직접 후원할 수 있습니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 서비스 준비 중 안내 */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Construction className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  서비스 준비 중
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  정치인 직접 후원 기능은 현재 개발 중입니다.
                  출시 알림을 받으시려면 아래에 이메일을 등록해주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 금액 선택 (비활성화) */}
          <div className="space-y-3 opacity-50 pointer-events-none">
            <label className="text-sm font-medium">후원 금액</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={selectedAmount === preset.value ? "default" : "outline"}
                  className={cn(
                    "h-12",
                    selectedAmount === preset.value && "ring-2 ring-primary"
                  )}
                  onClick={() => handleAmountSelect(preset.value)}
                  disabled
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="직접 입력"
                value={customAmount ? parseInt(customAmount).toLocaleString() : ""}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pr-10"
                disabled
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                원
              </span>
            </div>
          </div>

          {/* 이메일 알림 신청 */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              출시 알림 신청
            </label>
            {showSuccess ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">알림 신청이 완료되었습니다!</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="이메일 주소"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleNotifySubscribe}
                  disabled={!email || isSubscribed}
                >
                  신청
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              서비스가 출시되면 이메일로 알려드립니다
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            닫기
          </Button>
          <Button disabled className="gap-2">
            <Heart className="h-4 w-4" />
            후원하기 (준비중)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

