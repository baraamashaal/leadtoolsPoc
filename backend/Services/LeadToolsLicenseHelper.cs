using Leadtools;

namespace leadtools.Services;

/// <summary>
/// Helper class to manage LEADTOOLS licensing
/// </summary>
public static class LeadToolsLicenseHelper
{
    private static bool _isLicenseSet = false;
    private static readonly object _lockObject = new object();

    /// <summary>
    /// Sets the LEADTOOLS license. Must be called before using any LEADTOOLS functionality.
    /// </summary>
    public static void SetLicense()
    {
        if (_isLicenseSet)
            return;

        lock (_lockObject)
        {
            if (_isLicenseSet)
                return;

            try
            {
                // Get the project directory path
                string projectDirectory = Directory.GetCurrentDirectory();
                string licenseFilePath = Path.Combine(projectDirectory, "LEADTOOLSEvaluationLicense", "LEADTOOLS.lic");
                string keyFilePath = Path.Combine(projectDirectory, "LEADTOOLSEvaluationLicense", "LEADTOOLS.lic.key");

                // Read the developer key
                string developerKey = File.ReadAllText(keyFilePath);

                // Set the license
                RasterSupport.SetLicense(licenseFilePath, developerKey);

                Console.WriteLine("LEADTOOLS license set successfully!");
                _isLicenseSet = true;
            }
            catch (Exception ex)
            {
                // For evaluation, LEADTOOLS will run in evaluation mode with watermarks
                Console.WriteLine($"Warning: Could not set LEADTOOLS license: {ex.Message}");
                Console.WriteLine("Running in evaluation mode with limitations.");
                _isLicenseSet = true; // Set to true to avoid repeated attempts
            }
        }
    }

    /// <summary>
    /// Checks if LEADTOOLS license is set and valid
    /// </summary>
    public static bool IsLicenseValid()
    {
        try
        {
            return !RasterSupport.KernelExpired;
        }
        catch
        {
            return false;
        }
    }
}