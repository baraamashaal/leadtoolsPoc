namespace leadtools.Models;

/// <summary>
/// Represents the result of a PDF analysis operation
/// </summary>
public class PdfAnalysisResult
{
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int PageCount { get; set; }
    public string Version { get; set; } = string.Empty;
    public bool IsLinearized { get; set; }
    public bool IsEncrypted { get; set; }
    public List<PdfPageInfo> Pages { get; set; } = new();
}

/// <summary>
/// Information about a single PDF page
/// </summary>
public class PdfPageInfo
{
    public int PageNumber { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public int ImageCount { get; set; }
}
