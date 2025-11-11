using Leadtools;
using Leadtools.Codecs;
using Leadtools.Pdf;
using leadtools.Models;
using Microsoft.AspNetCore.Http;

namespace leadtools.Services;

/// <summary>
/// Handles PDF compression using LEADTOOLS advanced MRC (Mixed Raster Content) technology
/// </summary>
public class PdfCompressionService : IPdfCompressionService
{
    private readonly ILogger<PdfCompressionService> _logger;

    public PdfCompressionService(ILogger<PdfCompressionService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Compresses a PDF file using LEADTOOLS PDF Optimizer with MRC
    /// </summary>
    public async Task<PdfCompressionResult> CompressPdfAsync(IFormFile file, PdfCompressionQualityMode qualityMode)
    {
        using var inputStream = new MemoryStream();
        await file.CopyToAsync(inputStream);
        inputStream.Position = 0;

        // Create temporary files for LEADTOOLS PDF operations
        var tempInputPath = Path.GetTempFileName();
        var tempOutputPath = Path.GetTempFileName();

        try
        {
            // Save input stream to temporary file
            await File.WriteAllBytesAsync(tempInputPath, inputStream.ToArray());

            // Create PDF file instance (not using 'using' as it doesn't implement IDisposable)
            var pdfFile = new PDFFile(tempInputPath);

            // Get page count before compression
            var pageCount = pdfFile.GetPageCount();

            // Set optimizer options on the PDFFile instance
            ConfigureOptimizerOptions(pdfFile, qualityMode);

            _logger.LogInformation(
                "Compressing PDF: {FileName}, Pages: {PageCount}, Mode: {QualityMode}",
                file.FileName, pageCount, qualityMode);

            // Optimize the PDF (takes only destination file name)
            pdfFile.Optimize(tempOutputPath);

            // Read the compressed file
            var compressedBytes = await File.ReadAllBytesAsync(tempOutputPath);
            var originalSize = file.Length;
            var compressedSize = compressedBytes.Length;
            var compressionRatio = CalculateCompressionRatio(originalSize, compressedSize);

            _logger.LogInformation(
                "Compressed PDF: {FileName}, Original: {OriginalSize} bytes, Compressed: {CompressedSize} bytes, Ratio: {Ratio:F2}%",
                file.FileName, originalSize, compressedSize, compressionRatio);

            // Convert to base64
            var base64Pdf = Convert.ToBase64String(compressedBytes);
            var outputFileName = GenerateOutputFileName(file.FileName);

            return new PdfCompressionResult
            {
                FileName = outputFileName,
                OriginalSize = originalSize,
                CompressedSize = compressedSize,
                CompressionRatio = Math.Round(compressionRatio, 2),
                QualityMode = qualityMode.ToString(),
                PdfData = $"data:application/pdf;base64,{base64Pdf}",
                PageCount = pageCount,
                UsedMrcSegmentation = true
            };
        }
        finally
        {
            // Clean up temporary files
            if (File.Exists(tempInputPath))
                File.Delete(tempInputPath);
            if (File.Exists(tempOutputPath))
                File.Delete(tempOutputPath);
        }
    }

    /// <summary>
    /// Analyzes a PDF file without performing compression
    /// </summary>
    public async Task<PdfAnalysisResult> AnalyzePdfAsync(IFormFile file)
    {
        using var inputStream = new MemoryStream();
        await file.CopyToAsync(inputStream);
        inputStream.Position = 0;

        var tempInputPath = Path.GetTempFileName();

        try
        {
            // Save input stream to temporary file
            await File.WriteAllBytesAsync(tempInputPath, inputStream.ToArray());

            // Create PDF file instance (not using 'using' as it doesn't implement IDisposable)
            var pdfFile = new PDFFile(tempInputPath);

            // Load the PDF to access properties
            pdfFile.Load();

            var pageCount = pdfFile.GetPageCount();
            var isEncrypted = PDFFile.IsEncrypted(tempInputPath);
            var isLinearized = PDFFile.IsLinearized(tempInputPath, null);

            // Get version from document properties
            var version = pdfFile.DocumentProperties?.Producer ?? "Unknown";

            // Get page information from loaded pages
            var pages = new List<PdfPageInfo>();
            if (pdfFile.Pages != null)
            {
                for (int i = 0; i < Math.Min(pdfFile.Pages.Count, 10); i++) // Limit to first 10 pages
                {
                    var page = pdfFile.Pages[i];
                    pages.Add(new PdfPageInfo
                    {
                        PageNumber = i + 1,
                        Width = page.Width,
                        Height = page.Height,
                        ImageCount = 0 // Can be enhanced with more detailed analysis
                    });
                }
            }

            return new PdfAnalysisResult
            {
                FileName = file.FileName,
                FileSize = file.Length,
                PageCount = pageCount,
                Version = version,
                IsLinearized = isLinearized,
                IsEncrypted = isEncrypted,
                Pages = pages
            };
        }
        finally
        {
            // Clean up temporary file
            if (File.Exists(tempInputPath))
                File.Delete(tempInputPath);
        }
    }

    /// <summary>
    /// Configures PDF optimizer options based on quality mode
    /// </summary>
    private void ConfigureOptimizerOptions(PDFFile pdfFile, PdfCompressionQualityMode qualityMode)
    {
        // Create optimizer options
        var options = new PDFOptimizerOptions();

        switch (qualityMode)
        {
            case PdfCompressionQualityMode.BestQuality:
                options.AutoOptimizerMode = PDFAutoOptimizerMode.BestQuality;
                break;

            case PdfCompressionQualityMode.Balanced:
                options.AutoOptimizerMode = PDFAutoOptimizerMode.BestQuality;
                break;

            case PdfCompressionQualityMode.BestSize:
                options.AutoOptimizerMode = PDFAutoOptimizerMode.BestSize;
                break;

            case PdfCompressionQualityMode.Custom:
                options.AutoOptimizerMode = PDFAutoOptimizerMode.BestQuality;
                // Can be extended with custom options
                break;

            default:
                options.AutoOptimizerMode = PDFAutoOptimizerMode.BestQuality;
                break;
        }

        // Apply optimizer options to the PDFFile instance
        pdfFile.OptimizerOptions = options;
    }

    /// <summary>
    /// Calculates the compression ratio as a percentage
    /// </summary>
    private static double CalculateCompressionRatio(long originalSize, long compressedSize)
    {
        if (originalSize == 0) return 0;
        return ((double)(originalSize - compressedSize) / originalSize) * 100;
    }

    /// <summary>
    /// Generates an output filename for the compressed PDF
    /// </summary>
    private static string GenerateOutputFileName(string originalFileName)
    {
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        return $"compressed_{fileNameWithoutExtension}.pdf";
    }
}
