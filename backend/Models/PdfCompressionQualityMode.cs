namespace leadtools.Models;

/// <summary>
/// PDF compression quality modes for MRC optimization
/// </summary>
public enum PdfCompressionQualityMode
{
    /// <summary>
    /// Best quality with moderate compression
    /// </summary>
    BestQuality,

    /// <summary>
    /// Balanced quality and file size
    /// </summary>
    Balanced,

    /// <summary>
    /// Maximum compression with acceptable quality
    /// </summary>
    BestSize,

    /// <summary>
    /// Custom settings controlled by parameters
    /// </summary>
    Custom
}
