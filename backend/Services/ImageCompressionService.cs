using Leadtools.Codecs;
using leadtools.Models;
using Microsoft.AspNetCore.Http;

namespace leadtools.Services;

/// <summary>
/// Handles image compression and analysis operations using LEADTOOLS SDK
/// </summary>
public class ImageCompressionService : IImageCompressionService
{
    private readonly IImageFormatService _formatService;
    private readonly ILogger<ImageCompressionService> _logger;

    public ImageCompressionService(
        IImageFormatService formatService,
        ILogger<ImageCompressionService> logger)
    {
        _formatService = formatService;
        _logger = logger;
    }

    /// <summary>
    /// Compresses an uploaded image file using LEADTOOLS codec
    /// </summary>
    public Task<CompressionResult> CompressImageAsync(IFormFile file, int quality)
    {
        using var codecs = new RasterCodecs();
        using var inputStream = file.OpenReadStream();
        using var outputStream = new MemoryStream();

        // Load the image
        var image = codecs.Load(inputStream);
        var originalFormat = image.OriginalFormat;

        // Determine output format configuration
        var formatInfo = _formatService.DetermineOutputFormat(originalFormat, image.BitsPerPixel);

        // Configure quality settings for the codec
        _formatService.ConfigureQualitySettings(codecs, formatInfo.OutputFormat, quality);

        _logger.LogInformation(
            "Compressing image: Format {OriginalFormat} -> {OutputFormat}, Quality {InputQuality}%, BPP: {OriginalBpp} -> {OutputBpp}",
            originalFormat, formatInfo.OutputFormat, quality, image.BitsPerPixel, formatInfo.BitsPerPixel);

        // Save compressed image to output stream
        codecs.Save(image, outputStream, formatInfo.OutputFormat, formatInfo.BitsPerPixel);

        // Calculate compression statistics
        var originalSize = file.Length;
        var compressedSize = outputStream.Length;
        var compressionRatio = CalculateCompressionRatio(originalSize, compressedSize);

        _logger.LogInformation(
            "Compressed image: {FileName}, Original: {OriginalSize} bytes, Compressed: {CompressedSize} bytes, Ratio: {Ratio:F2}%",
            file.FileName, originalSize, compressedSize, compressionRatio);

        // Prepare result
        outputStream.Position = 0;
        var compressedBytes = outputStream.ToArray();
        var base64Image = Convert.ToBase64String(compressedBytes);
        var outputFileName = GenerateOutputFileName(file.FileName, formatInfo.FileExtension);

        var result = new CompressionResult
        {
            FileName = outputFileName,
            OriginalSize = originalSize,
            CompressedSize = compressedSize,
            CompressionRatio = Math.Round(compressionRatio, 2),
            Quality = quality,
            Format = formatInfo.OutputFormat.ToString(),
            ImageData = $"data:{formatInfo.MimeType};base64,{base64Image}"
        };

        return Task.FromResult(result);
    }

    /// <summary>
    /// Analyzes an image file without performing compression
    /// </summary>
    public Task<ImageAnalysisResult> AnalyzeImageAsync(IFormFile file)
    {
        using var codecs = new RasterCodecs();
        using var inputStream = file.OpenReadStream();

        // Load image info without loading full image data
        var imageInfo = codecs.GetInformation(inputStream, true);

        var result = new ImageAnalysisResult
        {
            FileName = file.FileName,
            OriginalSize = file.Length,
            Width = imageInfo.Width,
            Height = imageInfo.Height,
            BitsPerPixel = imageInfo.BitsPerPixel,
            Format = imageInfo.Format.ToString(),
            CompressionType = imageInfo.Compression.ToString()
        };

        return Task.FromResult(result);
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
    /// Generates an output filename with the appropriate extension
    /// </summary>
    private static string GenerateOutputFileName(string originalFileName, string newExtension)
    {
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        return $"compressed_{fileNameWithoutExtension}{newExtension}";
    }
}
