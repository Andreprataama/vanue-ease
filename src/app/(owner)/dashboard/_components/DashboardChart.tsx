"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface RevenueChartData {
  date: string; // Format YYYY-MM-DD
  revenue: number; // Nilai total pendapatan pada tanggal tersebut
}

// Konfigurasi Chart untuk data 'revenue'
const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "#F59E0B", // Kode HEX stabil untuk memastikan garis terlihat
  },
} satisfies ChartConfig;

// Custom Formatter untuk Tooltip dan Total (Rupiah Penuh)
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Custom Formatter untuk Sumbu Y (Rp5 Jt)
const formatYAxisTick = (value: number) => {
  if (value >= 1000000) {
    return `Rp${(value / 1000000).toFixed(1)} Jt`;
  }
  return `Rp${value.toLocaleString("id-ID")}`;
};

export function DashboardChart({
  chartData,
}: {
  chartData: RevenueChartData[];
}) {
  const totalRevenue = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.revenue, 0),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="py-4 sm:py-0">
        <CardHeader className="px-6 pb-3">
          <CardTitle>Tren Pendapatan (Revenue)</CardTitle>
          <CardDescription>
            Menampilkan total pendapatan dari semua transaksi sukses.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:p-6 h-[250px] flex items-center justify-center">
          <p className="text-gray-500">Tidak ada data untuk ditampilkan.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-4 mt-85 md:mt-0 sm:py-0">
      <CardHeader className="flex flex-col h-20 items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Tren Pendapatan </CardTitle>
          <CardDescription>
            Menampilkan total pendapatan dari semua transaksi sukses.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 5,
              right: 15,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />

            {/* Sumbu X (Tanggal) */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            {/* Sumbu Y (Pendapatan) */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatYAxisTick}
            />

            {/* Tooltip saat hover */}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="revenue"
                  // PERBAIKAN: Menggunakan 'formatter' untuk memformat nilai
                  formatter={(value) => formatRupiah(value as number)}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />

            {/* Garis Tren (stroke menggunakan kode HEX stabil) */}
            <Line
              dataKey="revenue"
              type="monotone"
              stroke={chartConfig.revenue.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
