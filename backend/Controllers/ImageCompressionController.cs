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
    /// <param name="file">The image file to compress (supports JPEG, PNG, BMP, GIF, TIFF, WebP)</param>
    /// <param name="quality">Compression quality (1-100, default: 75). Higher = better quality, larger file.</param>
    /// <returns>Compressed image data with compression statistics including format, size reduction, and base64 data</returns>
    [HttpPost("compress")]
    public IActionResult CompressImage(IFormFile file, [FromForm] int quality = 75)
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

            // Get the original format
            var originalFormat = image.OriginalFormat;

            // Determine output format and configure compression
            RasterImageFormat outputFormat;
            string mimeType;
            string fileExtension;
            int bitsPerPixel = image.BitsPerPixel;

            // Map original format to appropriate compressed format
            switch (originalFormat)
            {
                case RasterImageFormat.Png:
                    outputFormat = RasterImageFormat.Png;
                    mimeType = "image/png";
                    fileExtension = ".png";
                    // PNG quality factor: 0-9 (0=no compression, 9=max compression)
                    // Convert our 1-100 scale to PNG's 0-9 scale
                    codecs.Options.Png.Save.QualityFactor = 9 - ((quality - 1) * 9 / 99);
                    break;

                case RasterImageFormat.Jpeg:
                case RasterImageFormat.Jpeg411:
                case RasterImageFormat.Jpeg422:
                    outputFormat = RasterImageFormat.Jpeg;
                    mimeType = "image/jpeg";
                    fileExtension = ".jpg";
                    // Convert quality from standard scale (1-100) to LEADTOOLS scale (255-2)
                    var leadtoolsQuality = (int)(257 - (quality * 2.53));
                    codecs.Options.Jpeg.Save.QualityFactor = Math.Max(2, Math.Min(255, leadtoolsQuality));
                    // JPEG doesn't support alpha channel
                    if (bitsPerPixel <= 8)
                        bitsPerPixel = 8; // Grayscale
                    else if (bitsPerPixel == 12)
                        bitsPerPixel = 12; // Medical imaging
                    else
                        bitsPerPixel = 24; // Standard RGB
                    break;

                case RasterImageFormat.Gif:
                    outputFormat = RasterImageFormat.Gif;
                    mimeType = "image/gif";
                    fileExtension = ".gif";
                    bitsPerPixel = 8; // GIF is always 8-bit
                    break;

                case RasterImageFormat.Bmp:
                case RasterImageFormat.BmpRle:
                    outputFormat = RasterImageFormat.Bmp;
                    mimeType = "image/bmp";
                    fileExtension = ".bmp";
                    // BMP doesn't have quality settings in LEADTOOLS
                    break;

                case RasterImageFormat.Tif:
                case RasterImageFormat.TifJpeg:
                case RasterImageFormat.TifJpeg411:
                case RasterImageFormat.TifJpeg422:
                    outputFormat = RasterImageFormat.TifJpeg;
                    mimeType = "image/tiff";
                    fileExtension = ".tif";
                    // Use JPEG compression for TIFF
                    var tifQuality = (int)(257 - (quality * 2.53));
                    codecs.Options.Jpeg.Save.QualityFactor = Math.Max(2, Math.Min(255, tifQuality));
                    break;

                case RasterImageFormat.Webp:
                    outputFormat = RasterImageFormat.Webp;
                    mimeType = "image/webp";
                    fileExtension = ".webp";
                    // WebP quality: 1-100 (same as our scale)
                    codecs.Options.Webp.Save.QualityFactor = quality;
                    break;

                // For all other formats, default to JPEG
                default:
                    outputFormat = RasterImageFormat.Jpeg;
                    mimeType = "image/jpeg";
                    fileExtension = ".jpg";
                    var defaultQuality = (int)(257 - (quality * 2.53));
                    codecs.Options.Jpeg.Save.QualityFactor = Math.Max(2, Math.Min(255, defaultQuality));
                    if (bitsPerPixel <= 8)
                        bitsPerPixel = 8;
                    else if (bitsPerPixel == 12)
                        bitsPerPixel = 12;
                    else
                        bitsPerPixel = 24;
                    break;
            }

            _logger.LogInformation(
                "Compressing image: Format {OriginalFormat} -> {OutputFormat}, Quality {InputQuality}%, BPP: {OriginalBpp} -> {OutputBpp}",
                originalFormat, outputFormat, quality, image.BitsPerPixel, bitsPerPixel);

            // Save compressed image to output stream
            codecs.Save(image, outputStream, outputFormat, bitsPerPixel);

            // Calculate compression ratio
            var originalSize = file.Length;
            var compressedSize = outputStream.Length;
            var compressionRatio = ((double)(originalSize - compressedSize) / originalSize) * 100;

            _logger.LogInformation(
                "Compressed image: {FileName}, Original: {OriginalSize} bytes, Compressed: {CompressedSize} bytes, Ratio: {Ratio:F2}%",
                file.FileName, originalSize, compressedSize, compressionRatio);

            // Return compressed image data with statistics
            outputStream.Position = 0;
            var compressedBytes = outputStream.ToArray();
            var base64Image = Convert.ToBase64String(compressedBytes);

            // Generate output filename with correct extension
            var originalFileName = Path.GetFileNameWithoutExtension(file.FileName);
            var outputFileName = $"compressed_{originalFileName}{fileExtension}";

            return Ok(new
            {
                fileName = outputFileName,
                originalSize = originalSize,
                compressedSize = compressedSize,
                compressionRatio = Math.Round(compressionRatio, 2),
                quality = quality,
                format = outputFormat.ToString(),
                imageData = $"data:{mimeType};base64,{base64Image}"
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
    public IActionResult AnalyzeImage(IFormFile file)
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
