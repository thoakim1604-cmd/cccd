"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Upload, Scan, FileSearch } from "lucide-react";
import type { CCCDRecord } from "@/types";

interface ProcessingStatusProps {
  records: CCCDRecord[];
  onRetry?: (id: string) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    icon: Upload,
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    dotColor: "bg-gray-400",
  },
  uploading: {
    label: "Đang tải lên...",
    icon: Upload,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    dotColor: "bg-blue-500",
    animate: true,
  },
  processing: {
    label: "OCR đang xử lý...",
    icon: Scan,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    dotColor: "bg-indigo-500",
    animate: true,
  },
  extracting: {
    label: "Trích xuất dữ liệu...",
    icon: FileSearch,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    dotColor: "bg-purple-500",
    animate: true,
  },
  success: {
    label: "Hoàn tất",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
  },
  error: {
    label: "Lỗi",
    icon: AlertCircle,
    color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    dotColor: "bg-red-500",
  },
};

/**
 * Processing status display for each image being processed.
 * Shows real-time progress with animated status indicators.
 */
export function ProcessingStatus({ records, onRetry }: ProcessingStatusProps) {
  // Only show records that are actively processing or recently failed
  const activeRecords = records.filter(
    (r) => r.status !== "success" && r.status !== "pending"
  );

  if (activeRecords.length === 0) return null;

  return (
    <div className="space-y-2" id="processing-status">
      <p className="text-sm font-medium text-muted-foreground">
        Trạng thái xử lý
      </p>
      <div className="space-y-2">
        {activeRecords.map((record) => {
          const config = STATUS_CONFIG[record.status];
          const Icon = config.icon;

          return (
            <div
              key={record.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm"
            >
              {/* Status icon */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                {"animate" in config && config.animate ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                ) : (
                  <Icon
                    className={`h-4 w-4 ${
                      record.status === "error"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {record.fileName || "Unknown file"}
                </p>
                {record.errorMessage && (
                  <p className="text-xs text-red-500 truncate mt-0.5">
                    {record.errorMessage}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <Badge
                variant="secondary"
                className={`shrink-0 text-xs ${config.color}`}
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dotColor} ${
                    "animate" in config && config.animate ? "animate-pulse" : ""
                  }`}
                />
                {config.label}
              </Badge>

              {/* Retry button for errors */}
              {record.status === "error" && onRetry && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => onRetry(record.id)}
                  id={`retry-${record.id}`}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
