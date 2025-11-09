using Leadtools;
using Leadtools.Codecs;
using Microsoft.AspNetCore.Mvc;

namespace leadtools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImageCompressionController : ControllerBase
{
    private readonly ILogger<ImageCompressionController> _logger;

    public ImageCompressionController(ILogger<ImageCompressionController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Compresses an uploaded image using LEADTOOLS
    /// </summary>
    /// <param name="file">The image file to compress</param>
    /// <param name="quality">JPEG quality (1-100, default: 75)</param>
    /// <returns>Compressed image file</returns>
    [HttpPost("compress")]
    public async Task<IActionResult> CompressImage(IFormFile file, [FromForm] int quality = 75)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Validate quality parameter
        if (quality < 1 || quality > 100)
        {
            return BadRequest("Quality must be between 1 and 100");
        }

        try
        {
            using var codecs = new RasterCodecs();
            using var inputStream = file.OpenReadStream();
            using var outputStream = new MemoryStream();

            // Load the image
            var image = codecs.Load(inputStream);

            // Set compression quality for JPEG
            codecs.Options.Jpeg.Save.QualityFactor = quality;

            // Save compressed image to output stream
            codecs.Save(image, outputStream, RasterImageFormat.Jpeg, 24);

            // Calculate compression ratio
            var originalSize = file.Length;
            var compressedSize = outputStream.Length;
            var compressionRatio = ((double)(originalSize - compressedSize) / originalSize) * 100;

            _logger.LogInformation(
                "Compressed image: {FileName}, Original: {OriginalSize} bytes, Compressed: {CompressedSize} bytes, Ratio: {Ratio:F2}%",
                file.FileName, originalSize, compressedSize, compressionRatio);

            // Return compressed image
            outputStream.Position = 0;
            return File(outputStream.ToArray(), "image/jpeg", $"compressed_{file.FileName}");
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
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        try
        {
            using var codecs = new RasterCodecs();
            using var inputStream = file.OpenReadStream();

            // Load image info without loading full image
            var imageInfo = codecs.GetInformation(inputStream, true);

            return Ok(new
            {
                fileName = file.FileName,
                originalSize = file.Length,
                width = imageInfo.Width,
                height = imageInfo.Height,
                bitsPerPixel = imageInfo.BitsPerPixel,
                format = imageInfo.Format.ToString(),
                compressionType = imageInfo.Compression.ToString()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing image");
            return StatusCode(500, $"Error analyzing image: {ex.Message}");
        }
    }
}
