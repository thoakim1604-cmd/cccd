"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, ImagePlus, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface UploadZoneProps {
  onFilesAccepted: (files: File[]) => void;
  isProcessing: boolean;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

/**
 * Drag-and-drop upload zone for CCCD images.
 *
 * Features:
 * - Drag & drop support with visual feedback
 * - File picker button
 * - Multi-file upload
 * - File type and size validation
 * - Image preview thumbnails
 * - Animated states
 */
export function UploadZone({ onFilesAccepted, isProcessing }: UploadZoneProps) {
  const [previews, setPreviews] = useState<
    { file: File; url: string }[]
  >([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Show errors for rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        const messages = errors.map((e) => e.message).join(", ");
        toast.error(`${file.name}: ${messages}`);
      });

      if (acceptedFiles.length > 0) {
        // Create previews
        const newPreviews = acceptedFiles.map((file) => ({
          file,
          url: URL.createObjectURL(file),
        }));
        setPreviews((prev) => [...prev, ...newPreviews]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: true,
    disabled: isProcessing,
  });

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleProcess = () => {
    if (previews.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một ảnh CCCD");
      return;
    }

    const files = previews.map((p) => p.file);
    onFilesAccepted(files);
    toast.success(`Đang xử lý ${files.length} ảnh...`);

    // Clean up preview URLs
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed
          transition-all duration-300 ease-out cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01] shadow-lg shadow-blue-500/10"
              : "border-border hover:border-blue-400 hover:bg-muted/50"
          }
          ${isProcessing ? "opacity-50 pointer-events-none" : ""}
        `}
        id="upload-dropzone"
      >
        <input {...getInputProps()} id="file-input" />

        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {/* Animated icon */}
          <div
            className={`
              mb-4 flex h-16 w-16 items-center justify-center rounded-2xl
              transition-all duration-300
              ${
                isDragActive
                  ? "bg-blue-100 dark:bg-blue-900/50 scale-110"
                  : "bg-muted"
              }
            `}
          >
            {isDragActive ? (
              <ImagePlus className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {isDragActive ? (
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              Thả ảnh tại đây...
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-foreground">
                Kéo thả ảnh CCCD vào đây
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                hoặc{" "}
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  nhấn để chọn file
                </span>
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Hỗ trợ JPG, JPEG, PNG • Tối đa 10MB/ảnh • Nhiều ảnh cùng lúc
              </p>
            </>
          )}
        </div>

        {/* Gradient border animation when dragging */}
        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Preview Thumbnails */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {previews.length} ảnh đã chọn
            </p>
            <button
              onClick={handleProcess}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
              id="process-button"
            >
              <FileImage className="h-4 w-4" />
              Bắt đầu OCR
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {previews.map((preview, index) => (
              <div
                key={`${preview.file.name}-${index}`}
                className="group relative aspect-[3/2] rounded-xl overflow-hidden border border-border bg-muted shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Image
                  src={preview.url}
                  alt={preview.file.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(index);
                  }}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {/* File name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                  <p className="text-[10px] text-white truncate">
                    {preview.file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
