/**
 * Shared TypeScript types and interfaces
 */

export interface ImageAnalysis {
  fileName: string;
  originalSize: number;
  width: number;
  height: number;
  bitsPerPixel: number;
  format: string;
  compressionType: string;
}

export interface CompressionResult {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  quality: number;
  format: string;
  imageData: string;
}

export interface PdfAnalysis {
  fileName: string;
  fileSize: number;
  pageCount: number;
  version: string;
  isLinearized: boolean;
  isEncrypted: boolean;
  pages: Array<{
    pageNumber: number;
    width: number;
    height: number;
    imageCount: number;
  }>;
}

export interface PdfCompressionResult {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  qualityMode: string;
  pageCount: number;
  usedMrcSegmentation: boolean;
  pdfData: string;
}

export type QualityMode = 'BestQuality' | 'Balanced' | 'BestSize';

export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
  life?: number;
}
