using Leadtools;
using Leadtools.Codecs;
using leadtools.Models;

namespace leadtools.Services;

/// <summary>
/// Handles image format detection, mapping, and quality configuration
/// </summary>
public class ImageFormatService : IImageFormatService
{
    /// <summary>
    /// Determines the appropriate output format configuration based on the original format
    /// </summary>
    public ImageFormatInfo DetermineOutputFormat(RasterImageFormat originalFormat, int bitsPerPixel)
    {
        return originalFormat switch
        {
            RasterImageFormat.Png => new ImageFormatInfo
            {
                OutputFormat = RasterImageFormat.Png,
                MimeType = "image/png",
                FileExtension = ".png",
                BitsPerPixel = bitsPerPixel
            },

            RasterImageFormat.Jpeg or
            RasterImageFormat.Jpeg411 or
            RasterImageFormat.Jpeg422 => new ImageFormatInfo
            {
                OutputFormat = RasterImageFormat.Jpeg,
                MimeType = "image/jpeg",
                FileExtension = ".jpg",
                BitsPerPixel = NormalizeJpegBitsPerPixel(bitsPerPixel)
            },

            RasterImageFormat.Gif => new ImageFormatInfo
            {
                OutputFormat = RasterImageFormat.Gif,
                MimeType = "image/gif",
                FileExtension = ".gif",
                BitsPerPixel = 8 // GIF is always 8-bit
            },

            RasterImageFormat.Bmp or
            RasterImageFormat.BmpRle => new ImageFormatInfo
            {
                OutputFormat = RasterImageFormat.Bmp,
                MimeType = "image/bmp",
                FileExtension = ".bmp",
                BitsPerPixel = bitsPerPixel
            },

            RasterImageFormat.Tif or
            RasterImageFormat.TifJpeg or
            RasterImageFormat.TifJpeg411 or
            RasterImageFormat.TifJpeg422 => new ImageFormatInfo
            {
                OutputFormat = RasterImageFormat.TifJpeg,
                MimeType = "image/tiff",
                FileExtension = ".tif",
                BitsPerPixel = bitsPerPixel
            },

            RasterImageFormat.Webp => new ImageFormatInfo
            {
                OutputFormat = RasterImageFormat.Webp,
                MimeType = "image/webp",
                FileExtension = ".webp",
                BitsPerPixel = bitsPerPixel
            },

            // Default to JPEG for all other formats
            _ => new ImageFormatInfo
            {
                OutputFormat = RasterImageFormat.Jpeg,
                MimeType = "image/jpeg",
                FileExtension = ".jpg",
                BitsPerPixel = NormalizeJpegBitsPerPixel(bitsPerPixel)
            }
        };
    }

    /// <summary>
    /// Configures codec quality settings based on the output format
    /// </summary>
    public void ConfigureQualitySettings(RasterCodecs codecs, RasterImageFormat outputFormat, int quality)
    {
        switch (outputFormat)
        {
            case RasterImageFormat.Png:
                // PNG quality factor: 0-9 (0=no compression, 9=max compression)
                // Convert our 1-100 scale to PNG's 0-9 scale (inverted)
                codecs.Options.Png.Save.QualityFactor = 9 - ((quality - 1) * 9 / 99);
                break;

            case RasterImageFormat.Jpeg:
                // Convert quality from standard scale (1-100) to LEADTOOLS scale (255-2)
                codecs.Options.Jpeg.Save.QualityFactor = ConvertToLeadtoolsQuality(quality);
                break;

            case RasterImageFormat.TifJpeg:
                // TIFF with JPEG compression
                codecs.Options.Jpeg.Save.QualityFactor = ConvertToLeadtoolsQuality(quality);
                break;

            case RasterImageFormat.Webp:
                // WebP quality: 1-100 (same as our scale)
                codecs.Options.Webp.Save.QualityFactor = quality;
                break;

            // GIF and BMP don't have quality settings in LEADTOOLS
            case RasterImageFormat.Gif:
            case RasterImageFormat.Bmp:
            default:
                break;
        }
    }

    /// <summary>
    /// Normalizes bits per pixel for JPEG format
    /// JPEG doesn't support alpha channel and has specific bit depth requirements
    /// </summary>
    private static int NormalizeJpegBitsPerPixel(int bitsPerPixel)
    {
        return bitsPerPixel switch
        {
            <= 8 => 8,      // Grayscale
            12 => 12,       // Medical imaging
            _ => 24         // Standard RGB
        };
    }

    /// <summary>
    /// Converts standard quality (1-100) to LEADTOOLS quality (255-2)
    /// </summary>
    private static int ConvertToLeadtoolsQuality(int quality)
    {
        var leadtoolsQuality = (int)(257 - (quality * 2.53));
        return Math.Max(2, Math.Min(255, leadtoolsQuality));
    }
}
