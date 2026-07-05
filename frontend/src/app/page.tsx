"use client";

import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { StatsCards } from "@/components/stats-cards";
import { ProcessingStatus } from "@/components/processing-status";
import { DataTable } from "@/components/data-table";
import { ExportButton } from "@/components/export-button";
import { useOCR } from "@/hooks/use-ocr";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import type { CCCDRecord } from "@/types";

/**
 * Main application page.
 *
 * Layout:
 * 1. Header (logo + dark mode toggle)
 * 2. Upload Zone (drag & drop)
 * 3. Processing Status (real-time)
 * 4. Stats Cards (total, success, processing, error)
 * 5. Data Table (with inline editing)
 * 6. Export Button
 */
export default function HomePage() {
  const {
    records,
    stats,
    isProcessing,
    addFiles,
    retryRecord,
    editRecord,
    deleteRecord,
    addEmptyRecord,
    clearAll,
  } = useOCR();

  const hasData = records.some((r) => r.status === "success");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section with Upload */}
        <section className="space-y-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Nhận diện Căn cước công dân
            </h2>
            <p className="text-muted-foreground text-sm">
              Upload ảnh CCCD mặt trước, hệ thống sẽ tự động nhận diện và trích
              xuất thông tin sang Excel.
            </p>
          </div>
          <UploadZone onFilesAccepted={addFiles} isProcessing={isProcessing} />
        </section>

        {/* Processing Status */}
        <ProcessingStatus
          records={records}
          onRetry={(id) => {
            // For retry, we'd need the original file
            // Since we don't store files, we show a message
            const record = records.find((r) => r.id === id);
            if (record?.previewUrl) {
              // Try to re-fetch the image from the preview URL
              fetch(record.previewUrl)
                .then((res) => res.blob())
                .then((blob) => {
                  const file = new File(
                    [blob],
                    record.fileName || "retry.jpg",
                    { type: "image/jpeg" }
                  );
                  retryRecord(id, file);
                })
                .catch(() => {
                  // Preview URL may have been revoked
                  editRecord(
                    id,
                    "errorMessage" as keyof CCCDRecord,
                    "Không thể thử lại. Vui lòng upload lại ảnh."
                  );
                });
            }
          }}
        />

        {/* Stats Cards (show when we have records) */}
        {records.length > 0 && <StatsCards stats={stats} />}

        {/* Data Table & Actions */}
        {(hasData || records.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-semibold">Kết quả OCR</h3>
              <div className="flex items-center gap-2">
                {records.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="gap-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                    id="clear-all-button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa tất cả
                  </Button>
                )}
                <ExportButton records={records} />
              </div>
            </div>

            <DataTable
              records={records}
              onEdit={editRecord}
              onDelete={deleteRecord}
              onAddRow={addEmptyRecord}
            />
          </section>
        )}

        {/* Empty State */}
        {records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/80 mb-4">
              <Download className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              Bắt đầu bằng cách upload ảnh CCCD
            </h3>
            <p className="mt-1 text-sm text-muted-foreground/70 max-w-md">
              Hệ thống sẽ tự động nhận diện văn bản, trích xuất thông tin và
              cho phép bạn xuất ra file Excel.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            CCCD Scanner — Chỉ sử dụng cho các ảnh CCCD mà bạn có quyền hợp
            pháp. Dữ liệu không được lưu trữ trên server.
          </p>
        </div>
      </footer>
    </div>
  );
}
