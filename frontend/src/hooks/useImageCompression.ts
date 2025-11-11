import { useState } from 'react';
import { imageApi } from '../services/api';
import { CompressionResult, ImageAnalysis } from '../types';

export const useImageCompression = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [originalAnalysis, setOriginalAnalysis] = useState<ImageAnalysis | null>(null);
  const [compressedAnalysis, setCompressedAnalysis] = useState<ImageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingCompressed, setAnalyzingCompressed] = useState(false);

  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    try {
      const result = await imageApi.analyzeImage(file);
      setOriginalAnalysis(result);
      return result;
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeCompressedImage = async (imageData: string) => {
    setAnalyzingCompressed(true);
    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'compressed.jpg', { type: 'image/jpeg' });
      const result = await imageApi.analyzeImage(file);
      setCompressedAnalysis(result);
      return result;
    } finally {
      setAnalyzingCompressed(false);
    }
  };

  const compressImage = async (quality: number) => {
    if (!selectedFile) throw new Error('No file selected');

    setLoading(true);
    try {
      const result = await imageApi.compressImage(selectedFile, quality);
      setCompressedResult(result);
      await analyzeCompressedImage(result.imageData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCompressedResult(null);
    setOriginalAnalysis(null);
    setCompressedAnalysis(null);
  };

  return {
    selectedFile,
    setSelectedFile,
    previewUrl,
    setPreviewUrl,
    compressedResult,
    originalAnalysis,
    compressedAnalysis,
    loading,
    analyzing,
    analyzingCompressed,
    analyzeImage,
    analyzeCompressedImage,
    compressImage,
    reset,
  };
};
