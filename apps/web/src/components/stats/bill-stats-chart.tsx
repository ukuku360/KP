"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataItem {
  name: string;
  count: number;
}

export function BillStatsChart({ data }: { data: DataItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        데이터가 없습니다
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            fontSize={11}
            width={120}
            tickFormatter={(value) =>
              value.length > 10 ? value.slice(0, 10) + "..." : value
            }
          />
          <Tooltip formatter={(value: number) => [value + "건", "법안 수"]} />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
