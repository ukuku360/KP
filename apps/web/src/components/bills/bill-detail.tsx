"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, CalendarDays } from "lucide-react";

interface BillFile {
  id: string;
  fileType: string;
  fileName: string;
  fileUrl: string;
}

interface Bill {
  id: string;
  billNumber: string;
  billName: string;
  proposerType: string;
  proposer: string | null;
  committee: string;
  proposalReason: string;
  mainContent: string;
  noticeStart: Date;
  noticeEnd: Date;
  status: string;
  sourceUrl: string | null;
  files: BillFile[];
}

export function BillDetail({ bill }: { bill: Bill }) {
  const daysLeft = Math.ceil(
    (new Date(bill.noticeEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpired = daysLeft < 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={isExpired ? "secondary" : "default"} className="text-sm">
              {isExpired ? "종료됨" : `D-${daysLeft}`}
            </Badge>
            <Badge variant="outline">{bill.committee}</Badge>
            <Badge variant="secondary">{bill.proposerType}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{bill.billName}</h1>
          <p className="text-muted-foreground mt-1">
            의안번호: {bill.billNumber}
            {bill.proposer && ` | 제안자: ${bill.proposer}`}
          </p>
        </div>
        {bill.sourceUrl && (
          <Button variant="outline" asChild>
            <a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              원문 보기
            </a>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          입법예고 기간: {new Date(bill.noticeStart).toLocaleDateString("ko-KR")} ~{" "}
          {new Date(bill.noticeEnd).toLocaleDateString("ko-KR")}
        </span>
      </div>

      {bill.files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">첨부파일</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bill.files.map((file) => (
                <Button key={file.id} variant="outline" size="sm" asChild>
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    {file.fileName}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>제안이유</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {bill.proposalReason}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>주요내용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {bill.mainContent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
