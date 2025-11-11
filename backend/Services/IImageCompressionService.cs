using leadtools.Models;
using Microsoft.AspNetCore.Http;

namespace leadtools.Services;

/// <summary>
/// Service for handling image compression operations
/// </summary>
public interface IImageCompressionService
{
    /// <summary>
    /// Compresses an uploaded image file
    /// </summary>
    /// <param name="file">The image file to compress</param>
    /// <param name="quality">Compression quality (1-100)</param>
    /// <returns>Compression result with statistics and image data</returns>
    Task<CompressionResult> CompressImageAsync(IFormFile file, int quality);

    /// <summary>
    /// Analyzes an image without compressing it
    /// </summary>
    /// <param name="file">The image file to analyze</param>
    /// <returns>Image analysis result with metadata</returns>
    Task<ImageAnalysisResult> AnalyzeImageAsync(IFormFile file);
}
