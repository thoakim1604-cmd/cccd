"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Trash2,
  Edit3,
  Plus,
  FileX,
} from "lucide-react";
import type { CCCDRecord, SortConfig } from "@/types";

interface DataTableProps {
  records: CCCDRecord[];
  onEdit: (id: string, field: keyof CCCDRecord, value: string) => void;
  onDelete: (id: string) => void;
  onAddRow: () => void;
}

type EditableField = "name" | "dob" | "address" | "issueDate" | "issuedBy";

const COLUMNS: { key: EditableField; label: string; width: string }[] = [
  { key: "name", label: "Họ và tên", width: "w-[180px]" },
  { key: "dob", label: "Ngày sinh", width: "w-[120px]" },
  { key: "address", label: "Địa chỉ", width: "min-w-[220px]" },
  { key: "issueDate", label: "Ngày cấp", width: "w-[120px]" },
  { key: "issuedBy", label: "Cơ quan cấp", width: "min-w-[200px]" },
];

/**
 * Interactive data table for CCCD records.
 *
 * Features:
 * - Inline cell editing (click to edit)
 * - Sortable columns
 * - Search/filter
 * - Row actions (edit, delete)
 * - Add new row
 * - Empty state
 */
export function DataTable({
  records,
  onEdit,
  onDelete,
  onAddRow,
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: EditableField;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Only show completed records (success or manually added)
  const successRecords = records.filter((r) => r.status === "success");

  // Filter records by search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return successRecords;

    const query = searchQuery.toLowerCase();
    return successRecords.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.dob.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query) ||
        r.issueDate.toLowerCase().includes(query) ||
        r.issuedBy.toLowerCase().includes(query)
    );
  }, [successRecords, searchQuery]);

  // Sort records
  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords;

    return [...filteredRecords].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";

      if (sortConfig.direction === "asc") {
        return aVal.localeCompare(bVal, "vi");
      }
      return bVal.localeCompare(aVal, "vi");
    });
  }, [filteredRecords, sortConfig]);

  const handleSort = (key: EditableField) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null; // Reset sort
      }
      return { key, direction: "asc" };
    });
  };

  const startEditing = (id: string, field: EditableField, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editingCell) {
      onEdit(editingCell.id, editingCell.field, editValue);
      setEditingCell(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const getSortIcon = (key: EditableField) => {
    if (sortConfig?.key !== key)
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    if (sortConfig.direction === "asc")
      return <ArrowUp className="h-3.5 w-3.5 text-blue-600" />;
    return <ArrowDown className="h-3.5 w-3.5 text-blue-600" />;
  };

  return (
    <div className="space-y-3" id="data-table">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-lg"
            id="search-input"
          />
        </div>

        {/* Add Row Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddRow}
          className="h-9 rounded-lg gap-1.5"
          id="add-row-button"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm dòng
        </Button>

        {/* Record count */}
        <Badge variant="secondary" className="h-9 px-3 rounded-lg">
          {sortedRecords.length} / {successRecords.length} bản ghi
        </Badge>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[50px] text-center font-semibold">
                  #
                </TableHead>
                {COLUMNS.map((col) => (
                  <TableHead key={col.key} className={col.width}>
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1.5 font-semibold hover:text-foreground transition-colors"
                    >
                      {col.label}
                      {getSortIcon(col.key)}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="w-[60px] text-center font-semibold">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS.length + 2}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileX className="h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm">
                        {searchQuery
                          ? "Không tìm thấy kết quả phù hợp"
                          : "Chưa có dữ liệu. Upload ảnh CCCD để bắt đầu."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedRecords.map((record, index) => (
                  <TableRow
                    key={record.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-center text-muted-foreground text-sm tabular-nums">
                      {index + 1}
                    </TableCell>

                    {COLUMNS.map((col) => (
                      <TableCell key={col.key} className="p-1">
                        {editingCell?.id === record.id &&
                        editingCell?.field === col.key ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                            className="h-8 text-sm rounded-md"
                          />
                        ) : (
                          <div
                            onClick={() =>
                              startEditing(
                                record.id,
                                col.key,
                                record[col.key] || ""
                              )
                            }
                            className="px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm min-h-[32px] flex items-center"
                            title="Nhấn để chỉnh sửa"
                          >
                            <span
                              className={
                                record[col.key] === "N/A"
                                  ? "text-muted-foreground italic"
                                  : ""
                              }
                            >
                              {record[col.key] || "—"}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    ))}

                    <TableCell className="text-center p-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring opacity-0 group-hover:opacity-100 transition-opacity disabled:pointer-events-none disabled:opacity-50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              startEditing(record.id, "name", record.name)
                            }
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(record.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xoá dòng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
