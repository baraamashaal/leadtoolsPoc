using Leadtools;

namespace leadtools.Models;

/// <summary>
/// Represents image format configuration for compression
/// </summary>
public class ImageFormatInfo
{
    public RasterImageFormat OutputFormat { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public int BitsPerPixel { get; set; }
}
