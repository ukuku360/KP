"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoryItem {
  id: string;
  agreeCount: number;
  recordedAt: Date;
}

export function PetitionHistory({ history }: { history: HistoryItem[] }) {
  if (history.length === 0) {
    return null;
  }

  const chartData = history
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.recordedAt).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      }),
      count: item.agreeCount,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">동의수 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString() + "명", "동의수"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
