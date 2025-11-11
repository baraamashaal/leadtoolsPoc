namespace leadtools.Models;

/// <summary>
/// Represents the result of an image analysis operation
/// </summary>
public class ImageAnalysisResult
{
    public string FileName { get; set; } = string.Empty;
    public long OriginalSize { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public int BitsPerPixel { get; set; }
    public string Format { get; set; } = string.Empty;
    public string CompressionType { get; set; } = string.Empty;
}
