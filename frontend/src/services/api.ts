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
  blob: Blob;
  filename: string;
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

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `compressed_${file.name}`;

    return { blob, filename };
  },
};
