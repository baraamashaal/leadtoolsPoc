using leadtools.Services;
using Microsoft.AspNetCore.Mvc;

namespace leadtools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageCompressionController : ControllerBase
{
    private readonly IImageCompressionService _compressionService;
    private readonly IFileValidationService _validationService;
    private readonly ILogger<ImageCompressionController> _logger;

    public ImageCompressionController(
        IImageCompressionService compressionService,
        IFileValidationService validationService,
        ILogger<ImageCompressionController> logger)
    {
        _compressionService = compressionService;
        _validationService = validationService;
        _logger = logger;
    }

    /// <summary>
    /// Compresses an uploaded image using LEADTOOLS
    /// </summary>
    /// <param name="file">The image file to compress (supports JPEG, PNG, BMP, GIF, TIFF, WebP)</param>
    /// <param name="quality">Compression quality (1-100, default: 75). Higher = better quality, larger file.</param>
    /// <returns>Compressed image data with compression statistics including format, size reduction, and base64 data</returns>
    [HttpPost("compress")]
    public async Task<IActionResult> CompressImage(IFormFile file, [FromForm] int quality = 75)
    {
        // Validate file
        var (isValid, errorMessage) = _validationService.ValidateImageFile(file);
        if (!isValid)
        {
            return BadRequest(errorMessage);
        }

        // Validate quality parameter
        if (quality < 1 || quality > 100)
        {
            return BadRequest("Quality must be between 1 and 100");
        }

        try
        {
            var result = await _compressionService.CompressImageAsync(file, quality);

            return Ok(new
            {
                fileName = result.FileName,
                originalSize = result.OriginalSize,
                compressedSize = result.CompressedSize,
                compressionRatio = result.CompressionRatio,
                quality = result.Quality,
                format = result.Format,
                imageData = result.ImageData
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error compressing image");
            return StatusCode(500, $"Error compressing image: {ex.Message}");
        }
    }

    /// <summary>
    /// Gets compression information without saving
    /// </summary>
    [HttpPost("analyze")]
    public async Task<IActionResult> AnalyzeImage(IFormFile file)
    {
        // Validate file
        var (isValid, errorMessage) = _validationService.ValidateImageFile(file);
        if (!isValid)
        {
            return BadRequest(errorMessage);
        }

        try
        {
            var result = await _compressionService.AnalyzeImageAsync(file);

            return Ok(new
            {
                fileName = result.FileName,
                originalSize = result.OriginalSize,
                width = result.Width,
                height = result.Height,
                bitsPerPixel = result.BitsPerPixel,
                format = result.Format,
                compressionType = result.CompressionType
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing image");
            return StatusCode(500, $"Error analyzing image: {ex.Message}");
        }
    }
}
