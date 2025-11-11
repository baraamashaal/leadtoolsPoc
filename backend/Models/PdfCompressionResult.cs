namespace leadtools.Models;

/// <summary>
/// Represents the result of a PDF compression operation
/// </summary>
public class PdfCompressionResult
{
    public string FileName { get; set; } = string.Empty;
    public long OriginalSize { get; set; }
    public long CompressedSize { get; set; }
    public double CompressionRatio { get; set; }
    public string QualityMode { get; set; } = string.Empty;
    public string PdfData { get; set; } = string.Empty;
    public int PageCount { get; set; }
    public bool UsedMrcSegmentation { get; set; }
}
