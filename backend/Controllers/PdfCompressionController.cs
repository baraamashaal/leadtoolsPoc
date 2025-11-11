using leadtools.Models;
using leadtools.Services;
using Microsoft.AspNetCore.Mvc;

namespace leadtools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PdfCompressionController : ControllerBase
{
    private readonly IPdfCompressionService _pdfCompressionService;
    private readonly IFileValidationService _validationService;
    private readonly ILogger<PdfCompressionController> _logger;

    public PdfCompressionController(
        IPdfCompressionService pdfCompressionService,
        IFileValidationService validationService,
        ILogger<PdfCompressionController> logger)
    {
        _pdfCompressionService = pdfCompressionService;
        _validationService = validationService;
        _logger = logger;
    }

    /// <summary>
    /// Compresses a PDF file using advanced MRC (Mixed Raster Content) technology
    /// </summary>
    /// <param name="file">The PDF file to compress</param>
    /// <param name="qualityMode">Compression quality mode: BestQuality, Balanced, BestSize, Custom (default: Balanced)</param>
    /// <returns>Compressed PDF data with compression statistics</returns>
    [HttpPost("compress")]
    public async Task<IActionResult> CompressPdf(IFormFile file, [FromForm] string qualityMode = "Balanced")
    {
        // Validate file
        var (isValid, errorMessage) = _validationService.ValidatePdfFile(file);
        if (!isValid)
        {
            return BadRequest(errorMessage);
        }

        // Parse quality mode
        if (!Enum.TryParse<PdfCompressionQualityMode>(qualityMode, true, out var mode))
        {
            return BadRequest($"Invalid quality mode. Valid options: {string.Join(", ", Enum.GetNames<PdfCompressionQualityMode>())}");
        }

        try
        {
            var result = await _pdfCompressionService.CompressPdfAsync(file, mode);

            return Ok(new
            {
                fileName = result.FileName,
                originalSize = result.OriginalSize,
                compressedSize = result.CompressedSize,
                compressionRatio = result.CompressionRatio,
                qualityMode = result.QualityMode,
                pageCount = result.PageCount,
                usedMrcSegmentation = result.UsedMrcSegmentation,
                pdfData = result.PdfData
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error compressing PDF");
            return StatusCode(500, $"Error compressing PDF: {ex.Message}");
        }
    }

    /// <summary>
    /// Analyzes a PDF file without compressing it
    /// </summary>
    /// <param name="file">The PDF file to analyze</param>
    /// <returns>PDF analysis result with metadata</returns>
    [HttpPost("analyze")]
    public async Task<IActionResult> AnalyzePdf(IFormFile file)
    {
        // Validate file
        var (isValid, errorMessage) = _validationService.ValidatePdfFile(file);
        if (!isValid)
        {
            return BadRequest(errorMessage);
        }

        try
        {
            var result = await _pdfCompressionService.AnalyzePdfAsync(file);

            return Ok(new
            {
                fileName = result.FileName,
                fileSize = result.FileSize,
                pageCount = result.PageCount,
                version = result.Version,
                isLinearized = result.IsLinearized,
                isEncrypted = result.IsEncrypted,
                pages = result.Pages.Select(p => new
                {
                    pageNumber = p.PageNumber,
                    width = p.Width,
                    height = p.Height,
                    imageCount = p.ImageCount
                })
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing PDF");
            return StatusCode(500, $"Error analyzing PDF: {ex.Message}");
        }
    }
}
