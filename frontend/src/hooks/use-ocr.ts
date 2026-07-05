"use client";

import { useState, useCallback, useRef } from "react";
import type { CCCDRecord, OCRResponse, OCRStats } from "@/types";


const MAX_CONCURRENT = 3;

/**
 * Generate a unique ID for each record.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Custom hook for managing OCR processing pipeline.
 *
 * Handles file upload, OCR API calls, progress tracking,
 * and retry logic for failed images.
 */
export function useOCR() {
  const [records, setRecords] = useState<CCCDRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingQueue = useRef<CCCDRecord[]>([]);
  const activeCount = useRef(0);

  /** Compute statistics from current records */
  const stats: OCRStats = {
    total: records.length,
    success: records.filter((r) => r.status === "success").length,
    error: records.filter((r) => r.status === "error").length,
    processing: records.filter(
      (r) =>
        r.status === "uploading" ||
        r.status === "processing" ||
        r.status === "extracting"
    ).length,
  };

  /**
   * Update a specific record by ID.
   */
  const updateRecord = useCallback(
    (id: string, updates: Partial<CCCDRecord>) => {
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    []
  );

  /**
   * Process a single image through the OCR pipeline.
   */
  const processImage = useCallback(
    async (record: CCCDRecord, file: File) => {
      const { id } = record;

      try {
        // Step 1: Uploading
        updateRecord(id, { status: "uploading" });

        const formData = new FormData();
        formData.append("file", file);

        // Step 2: Processing (OCR)
        updateRecord(id, { status: "processing" });

        const response = await fetch(`/api/ocr`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.detail || `Server error: ${response.status}`
          );
        }

        // Step 3: Extracting data
        updateRecord(id, { status: "extracting" });

        const result: OCRResponse = await response.json();

        if (!result.success) {
          throw new Error("OCR processing returned unsuccessful result");
        }

        // Step 4: Success
        updateRecord(id, {
          status: "success",
          name: result.data.name,
          dob: result.data.dob,
          address: result.data.address,
          issueDate: result.data.issue_date,
          issuedBy: result.data.issued_by,
          ocrLines: result.ocr_lines,
          processingTime: result.processing_time,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        updateRecord(id, {
          status: "error",
          errorMessage: message,
        });
      } finally {
        activeCount.current--;
        processNextInQueue();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateRecord]
  );

  /**
   * Process next items in the queue if capacity allows.
   */
  const processNextInQueue = useCallback(() => {
    while (
      activeCount.current < MAX_CONCURRENT &&
      processingQueue.current.length > 0
    ) {
      const next = processingQueue.current.shift();
      if (next && next._file) {
        activeCount.current++;
        processImage(next, next._file);
      }
    }

    // Check if all processing is complete
    if (
      activeCount.current === 0 &&
      processingQueue.current.length === 0
    ) {
      setIsProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processImage]);

  /**
   * Add files to the processing queue and start OCR.
   */
  const addFiles = useCallback(
    (files: File[]) => {
      const newRecords: (CCCDRecord & { _file?: File })[] = files.map(
        (file) => ({
          id: generateId(),
          name: "N/A",
          dob: "N/A",
          address: "N/A",
          issueDate: "N/A",
          issuedBy: "N/A",
          status: "pending" as const,
          fileName: file.name,
          previewUrl: URL.createObjectURL(file),
          _file: file,
        })
      );

      setRecords((prev) => [...prev, ...newRecords]);
      processingQueue.current.push(...newRecords);
      setIsProcessing(true);

      // Start processing
      processNextInQueue();
    },
    [processNextInQueue]
  );

  /**
   * Retry OCR for a failed record.
   */
  const retryRecord = useCallback(
    (id: string, file: File) => {
      updateRecord(id, {
        status: "pending",
        errorMessage: undefined,
        name: "N/A",
        dob: "N/A",
        address: "N/A",
        issueDate: "N/A",
        issuedBy: "N/A",
      });

      const record = records.find((r) => r.id === id);
      if (record) {
        const retryRecord = { ...record, _file: file } as CCCDRecord & {
          _file: File;
        };
        processingQueue.current.push(retryRecord);
        setIsProcessing(true);
        processNextInQueue();
      }
    },
    [records, updateRecord, processNextInQueue]
  );

  /**
   * Edit a record field.
   */
  const editRecord = useCallback(
    (id: string, field: keyof CCCDRecord, value: string) => {
      updateRecord(id, { [field]: value });
    },
    [updateRecord]
  );

  /**
   * Delete a record.
   */
  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => {
      const record = prev.find((r) => r.id === id);
      if (record?.previewUrl) {
        URL.revokeObjectURL(record.previewUrl);
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  /**
   * Add a new empty record.
   */
  const addEmptyRecord = useCallback(() => {
    const newRecord: CCCDRecord = {
      id: generateId(),
      name: "",
      dob: "",
      address: "",
      issueDate: "",
      issuedBy: "",
      status: "success",
      fileName: "Manual entry",
    };
    setRecords((prev) => [...prev, newRecord]);
  }, []);

  /**
   * Clear all records.
   */
  const clearAll = useCallback(() => {
    records.forEach((r) => {
      if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
    });
    setRecords([]);
    processingQueue.current = [];
    activeCount.current = 0;
    setIsProcessing(false);
  }, [records]);

  return {
    records,
    stats,
    isProcessing,
    addFiles,
    retryRecord,
    editRecord,
    deleteRecord,
    addEmptyRecord,
    clearAll,
    setRecords,
  };
}
