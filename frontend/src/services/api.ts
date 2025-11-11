import { API_CONFIG } from '../constants/config';
import type {
  ImageAnalysis,
  CompressionResult,
  PdfAnalysis,
  PdfCompressionResult,
  QualityMode,
} from '../types';

const { BASE_URL } = API_CONFIG;

export const imageApi = {
  async analyzeImage(file: File): Promise<ImageAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/ImageCompression/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze image: ${response.statusText}`);
    }

    return response.json();
  },

  async compressImage(file: File, quality: number = 75): Promise<CompressionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality.toString());

    const response = await fetch(`${BASE_URL}/ImageCompression/compress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to compress image: ${response.statusText}`);
    }

    return response.json();
  },
};

export const pdfApi = {
  async analyzePdf(file: File): Promise<PdfAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/PdfCompression/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze PDF: ${response.statusText}`);
    }

    return response.json();
  },

  async compressPdf(file: File, qualityMode: QualityMode = 'Balanced'): Promise<PdfCompressionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('qualityMode', qualityMode);

    const response = await fetch(`${BASE_URL}/PdfCompression/compress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to compress PDF: ${response.statusText}`);
    }

    return response.json();
  },
};
