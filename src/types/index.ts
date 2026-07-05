/**
 * Type definitions for the CCCD OCR Web Application.
 */

/** Status of an individual image processing job */
export type ProcessingStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "extracting"
  | "success"
  | "error";

/** A single CCCD record extracted from an image */
export interface CCCDRecord {
  /** Unique identifier for this record */
  id: string;
  /** Họ và tên (Full name) */
  name: string;
  /** Ngày sinh (Date of birth) - dd/mm/yyyy */
  dob: string;
  /** Nơi thường trú (Address) */
  address: string;
  /** Ngày cấp / Có giá trị đến (Issue date) - dd/mm/yyyy */
  issueDate: string;
  /** Cơ quan cấp (Issuing authority) */
  issuedBy: string;
  /** Processing status */
  status: ProcessingStatus;
  /** Error message if processing failed */
  errorMessage?: string;
  /** Original filename */
  fileName?: string;
  /** Preview URL for the uploaded image */
  previewUrl?: string;
  /** Raw OCR lines for debugging */
  ocrLines?: string[];
  /** Processing time in seconds */
  processingTime?: number;
}

/** Response from the OCR API */
export interface OCRResponse {
  success: boolean;
  data: {
    name: string;
    dob: string;
    address: string;
    issue_date: string;
    issued_by: string;
  };
  ocr_lines: string[];
  processing_time: number;
}

/** Statistics for the dashboard */
export interface OCRStats {
  total: number;
  success: number;
  error: number;
  processing: number;
}

/** Sort configuration */
export interface SortConfig {
  key: keyof Pick<CCCDRecord, "name" | "dob" | "address" | "issueDate" | "issuedBy">;
  direction: "asc" | "desc";
}
