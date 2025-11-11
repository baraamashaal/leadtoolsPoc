using Leadtools;
using Leadtools.Codecs;
using leadtools.Models;

namespace leadtools.Services;

/// <summary>
/// Service for handling image format detection and configuration
/// </summary>
public interface IImageFormatService
{
    /// <summary>
    /// Determines the output format configuration based on the original format
    /// </summary>
    ImageFormatInfo DetermineOutputFormat(RasterImageFormat originalFormat, int bitsPerPixel);

    /// <summary>
    /// Configures codec quality settings for the specified format
    /// </summary>
    void ConfigureQualitySettings(RasterCodecs codecs, RasterImageFormat outputFormat, int quality);
}
