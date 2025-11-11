using Microsoft.AspNetCore.Http;

namespace leadtools.Services;

/// <summary>
/// Handles file validation for uploads
/// </summary>
public class FileValidationService : IFileValidationService
{
    private readonly ILogger<FileValidationService> _logger;

    // File size limits
    private const long MaxImageSize = 10 * 1024 * 1024; // 10MB
    private const long MaxPdfSize = 50 * 1024 * 1024; // 50MB

    // Allowed file extensions
    private static readonly HashSet<string> AllowedImageExtensions = new()
    {
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif"
    };

    private static readonly HashSet<string> AllowedPdfExtensions = new()
    {
        ".pdf"
    };

    public FileValidationService(ILogger<FileValidationService> logger)
    {
        _logger = logger;
    }

    public (bool IsValid, string ErrorMessage) ValidateImageFile(IFormFile file)
    {
        // Check if file exists
        if (file == null || file.Length == 0)
        {
            return (false, "No file uploaded");
        }

        // Check file size
        if (file.Length > MaxImageSize)
        {
            return (false, $"File size exceeds maximum limit of {MaxImageSize / (1024 * 1024)}MB");
        }

        // Check file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(extension))
        {
            return (false, $"Invalid file type. Allowed types: {string.Join(", ", AllowedImageExtensions)}");
        }

        _logger.LogInformation("Image file validated successfully: {FileName}, Size: {Size} bytes",
            file.FileName, file.Length);

        return (true, string.Empty);
    }

    public (bool IsValid, string ErrorMessage) ValidatePdfFile(IFormFile file)
    {
        // Check if file exists
        if (file == null || file.Length == 0)
        {
            return (false, "No file uploaded");
        }

        // Check file size
        if (file.Length > MaxPdfSize)
        {
            return (false, $"File size exceeds maximum limit of {MaxPdfSize / (1024 * 1024)}MB");
        }

        // Check file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedPdfExtensions.Contains(extension))
        {
            return (false, "Invalid file type. Only PDF files are supported");
        }

        _logger.LogInformation("PDF file validated successfully: {FileName}, Size: {Size} bytes",
            file.FileName, file.Length);

        return (true, string.Empty);
    }
}
