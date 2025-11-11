import { useState } from 'react';
import { pdfApi } from '../services/api';
import { PdfAnalysis, PdfCompressionResult, QualityMode } from '../types';

export const usePdfCompression = () => {
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfAnalysis, setPdfAnalysis] = useState<PdfAnalysis | null>(null);
  const [compressedResult, setCompressedResult] = useState<PdfCompressionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzePdf = async (file: File) => {
    setAnalyzing(true);
    try {
      const result = await pdfApi.analyzePdf(file);
      setPdfAnalysis(result);
      return result;
    } finally {
      setAnalyzing(false);
    }
  };

  const compressPdf = async (qualityMode: QualityMode) => {
    if (!selectedPdf) throw new Error('No PDF selected');

    setLoading(true);
    try {
      const result = await pdfApi.compressPdf(selectedPdf, qualityMode);
      setCompressedResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedPdf(null);
    setPdfAnalysis(null);
    setCompressedResult(null);
  };

  return {
    selectedPdf,
    setSelectedPdf,
    pdfAnalysis,
    compressedResult,
    loading,
    analyzing,
    analyzePdf,
    compressPdf,
    reset,
  };
};
