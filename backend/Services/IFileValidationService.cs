using Microsoft.AspNetCore.Http;

namespace leadtools.Services;

/// <summary>
/// Service for validating uploaded files
/// </summary>
public interface IFileValidationService
{
    /// <summary>
    /// Validates an image file
    /// </summary>
    (bool IsValid, string ErrorMessage) ValidateImageFile(IFormFile file);

    /// <summary>
    /// Validates a PDF file
    /// </summary>
    (bool IsValid, string ErrorMessage) ValidatePdfFile(IFormFile file);
}
