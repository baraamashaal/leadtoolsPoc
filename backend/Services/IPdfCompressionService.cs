using leadtools.Models;
using Microsoft.AspNetCore.Http;

namespace leadtools.Services;

/// <summary>
/// Service for handling PDF compression operations with MRC (Mixed Raster Content)
/// </summary>
public interface IPdfCompressionService
{
    /// <summary>
    /// Compresses a PDF file using advanced MRC segmentation
    /// </summary>
    /// <param name="file">The PDF file to compress</param>
    /// <param name="qualityMode">Compression quality mode</param>
    /// <returns>Compression result with statistics and PDF data</returns>
    Task<PdfCompressionResult> CompressPdfAsync(IFormFile file, PdfCompressionQualityMode qualityMode);

    /// <summary>
    /// Analyzes a PDF file without compressing it
    /// </summary>
    /// <param name="file">The PDF file to analyze</param>
    /// <returns>PDF analysis result with metadata</returns>
    Task<PdfAnalysisResult> AnalyzePdfAsync(IFormFile file);
}
