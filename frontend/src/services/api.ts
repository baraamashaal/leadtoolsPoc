const API_BASE_URL = '/api';

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

export const imageApi = {
  async analyzeImage(file: File): Promise<ImageAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/ImageCompression/analyze`, {
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

    const response = await fetch(`${API_BASE_URL}/ImageCompression/compress`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to compress image: ${response.statusText}`);
    }

    return response.json();
  },
};
