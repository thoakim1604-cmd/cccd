"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import type { CCCDRecord } from "@/types";

interface ExportButtonProps {
  records: CCCDRecord[];
}

/**
 * Excel export button component.
 *
 * Uses ExcelJS (client-side) to generate a styled .xlsx file:
 * - Blue header with white text
 * - Auto column width
 * - Frozen header row
 * - Unicode font support
 */
export function ExportButton({ records }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const successRecords = records.filter((r) => r.status === "success");

  const handleExport = async () => {
    if (successRecords.length === 0) {
      toast.warning("Chưa có dữ liệu để xuất Excel");
      return;
    }

    setIsExporting(true);

    try {
      // Dynamic import to reduce initial bundle size
      const ExcelJS = (await import("exceljs")).default;
      const { saveAs } = await import("file-saver");

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "CCCD Scanner";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("CCCD Data", {
        views: [{ state: "frozen", ySplit: 1 }], // Freeze header row
      });

      // Define columns with Vietnamese headers
      worksheet.columns = [
        { header: "Họ và tên", key: "name", width: 25 },
        { header: "Ngày sinh", key: "dob", width: 15 },
        { header: "Địa chỉ", key: "address", width: 40 },
        { header: "Ngày cấp", key: "issueDate", width: 15 },
        { header: "Cơ quan cấp", key: "issuedBy", width: 35 },
      ];

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF2563EB" }, // Blue-600
        };
        cell.font = {
          name: "Arial",
          bold: true,
          color: { argb: "FFFFFFFF" }, // White
          size: 12,
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF1D4ED8" } },
          bottom: { style: "thin", color: { argb: "FF1D4ED8" } },
          left: { style: "thin", color: { argb: "FF1D4ED8" } },
          right: { style: "thin", color: { argb: "FF1D4ED8" } },
        };
      });
      headerRow.height = 30;

      // Add data rows
      successRecords.forEach((record) => {
        const row = worksheet.addRow({
          name: record.name,
          dob: record.dob,
          address: record.address,
          issueDate: record.issueDate,
          issuedBy: record.issuedBy,
        });

        row.eachCell((cell) => {
          cell.font = {
            name: "Arial",
            size: 11,
          };
          cell.alignment = {
            vertical: "middle",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
        });
      });

      // Auto-fit column widths (approximate)
      worksheet.columns.forEach((column) => {
        if (column.eachCell) {
          let maxLength = column.header?.length || 10;
          column.eachCell({ includeEmpty: false }, (cell) => {
            const cellValue = cell.value?.toString() || "";
            maxLength = Math.max(maxLength, cellValue.length);
          });
          column.width = Math.min(Math.max(maxLength + 4, 12), 50);
        }
      });

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "cccd_result.xlsx");

      toast.success("Export thành công!", {
        description: `Đã xuất ${successRecords.length} bản ghi ra file cccd_result.xlsx`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất Excel", {
        description: "Vui lòng thử lại",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || successRecords.length === 0}
      className="gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
      id="export-button"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang xuất...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
          {successRecords.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 px-1.5 text-[10px] bg-white/20 text-white border-0"
            >
              {successRecords.length}
            </Badge>
          )}
        </>
      )}
    </Button>
  );
}
