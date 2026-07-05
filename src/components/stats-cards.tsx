"use client";

import { Images, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OCRStats } from "@/types";

interface StatsCardsProps {
  stats: OCRStats;
}

/**
 * Statistics cards showing OCR processing overview.
 * Displays total images, successful, errors, and processing count.
 * Features animated counters and gradient accents.
 */
export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Tổng ảnh",
      value: stats.total,
      icon: Images,
      gradient: "from-blue-500 to-indigo-500",
      bgGlow: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Thành công",
      value: stats.success,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Đang xử lý",
      value: stats.processing,
      icon: Loader2,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
      animate: stats.processing > 0,
    },
    {
      label: "Lỗi",
      value: stats.error,
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-500",
      bgGlow: "bg-red-500/10",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" id="stats-cards">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 py-0"
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bgGlow}`}
            >
              <card.icon
                className={`h-5 w-5 ${card.textColor} ${
                  card.animate ? "animate-spin" : ""
                }`}
              />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
          {/* Gradient accent line */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient} opacity-60`}
          />
        </Card>
      ))}
    </div>
  );
}
