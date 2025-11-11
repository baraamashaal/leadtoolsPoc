namespace leadtools.Models;

/// <summary>
/// Represents the result of an image compression operation
/// </summary>
public class CompressionResult
{
    public string FileName { get; set; } = string.Empty;
    public long OriginalSize { get; set; }
    public long CompressedSize { get; set; }
    public double CompressionRatio { get; set; }
    public int Quality { get; set; }
    public string Format { get; set; } = string.Empty;
    public string ImageData { get; set; } = string.Empty;
}
