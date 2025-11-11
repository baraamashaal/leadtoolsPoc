import { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { imageApi, ImageAnalysis, CompressionResult } from './services/api';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [originalAnalysis, setOriginalAnalysis] = useState<ImageAnalysis | null>(null);
  const [compressedAnalysis, setCompressedAnalysis] = useState<ImageAnalysis | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingCompressed, setAnalyzingCompressed] = useState(false);
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    if (!file) return;

    setSelectedFile(file);
    setCompressedResult(null);
    setOriginalAnalysis(null);
    setCompressedAnalysis(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-analyze
    await handleAnalyze(file);
  };

  const handleAnalyze = async (file?: File) => {
    const targetFile = file || selectedFile;
    if (!targetFile) return;

    setAnalyzing(true);
    try {
      const result = await imageApi.analyzeImage(targetFile);
      setOriginalAnalysis(result);
      toast.current?.show({
        severity: 'success',
        summary: 'Analysis Complete',
        detail: 'Original image analyzed successfully',
        life: 3000,
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to analyze image',
        life: 3000,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeCompressedImage = async (imageData: string) => {
    setAnalyzingCompressed(true);
    try {
      // Convert base64 data URL to File object
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'compressed.jpg', { type: 'image/jpeg' });

      const result = await imageApi.analyzeImage(file);
      setCompressedAnalysis(result);
    } catch (error) {
      console.error('Error analyzing compressed image:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to analyze compressed image',
        life: 3000,
      });
    } finally {
      setAnalyzingCompressed(false);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await imageApi.compressImage(selectedFile, quality);
      setCompressedResult(result);

      // Automatically analyze the compressed image
      await analyzeCompressedImage(result.imageData);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Image compressed successfully',
        life: 3000,
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to compress image',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressedResult) return;

    const a = document.createElement('a');
    a.href = compressedResult.imageData;
    a.download = compressedResult.fileName;
    a.click();

    toast.current?.show({
      severity: 'success',
      summary: 'Downloaded',
      detail: 'Compressed image downloaded successfully',
      life: 3000,
    });
  };

  return (
    <div className="app-container">
      <Toast ref={toast} />

      <div className="header">
        <h1>🖼️ LEADTOOLS Image Compressor</h1>
        <p>Professional-grade image compression powered by LEADTOOLS SDK</p>
      </div>

      <div className="main-grid">
        {/* Upload Section */}
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <i className="pi pi-cloud-upload" style={{ fontSize: '3rem', color: '#667eea' }}></i>
            <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Upload Image</h2>
            <p style={{ color: '#718096' }}>Select an image to compress and analyze</p>
          </div>

          <FileUpload
            ref={fileUploadRef}
            name="file"
            accept="image/*"
            maxFileSize={10000000}
            customUpload
            uploadHandler={handleFileSelect}
            auto
            chooseLabel="Select Image"
            className="mb-3"
          />

          {previewUrl && (
            <div style={{ marginTop: '1.5rem' }}>
              <img src={previewUrl} alt="Preview" className="preview-image" />

              <Divider />

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Compression Quality: {quality}%
                </label>
                <Slider value={quality} onChange={(e) => setQuality(e.value as number)} min={1} max={100} />
              </div>

              <Button
                label="Compress Image"
                icon="pi pi-compress"
                onClick={handleCompress}
                disabled={loading}
                loading={loading}
                className="w-full p-button-lg p-button-primary"
                style={{ width: '100%' }}
              />
            </div>
          )}
        </Card>

        {/* Analysis Section */}
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <i className="pi pi-chart-bar" style={{ fontSize: '3rem', color: '#667eea' }}></i>
            <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Image Analysis</h2>
            <p style={{ color: '#718096' }}>Detailed information about your image</p>
          </div>

          {analyzing ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
              <p style={{ marginTop: '1rem', color: '#718096' }}>Analyzing original image...</p>
            </div>
          ) : originalAnalysis ? (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
                <i className="pi pi-file" style={{ marginRight: '0.5rem' }}></i>
                Original Image
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>File Name</label>
                  <div className="value" title={originalAnalysis.fileName}>
                    {originalAnalysis.fileName.length > 20
                      ? originalAnalysis.fileName.substring(0, 20) + '...'
                      : originalAnalysis.fileName}
                  </div>
                </div>
                <div className="info-item">
                  <label>File Size</label>
                  <div className="value">{formatBytes(originalAnalysis.originalSize)}</div>
                </div>
                <div className="info-item">
                  <label>Dimensions</label>
                  <div className="value">
                    {originalAnalysis.width} × {originalAnalysis.height}
                  </div>
                </div>
                <div className="info-item">
                  <label>Bits Per Pixel</label>
                  <div className="value">{originalAnalysis.bitsPerPixel}</div>
                </div>
                <div className="info-item">
                  <label>Format</label>
                  <div className="value">{originalAnalysis.format}</div>
                </div>
                <div className="info-item">
                  <label>Compression Type</label>
                  <div className="value">{originalAnalysis.compressionType}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#a0aec0' }}>
              <i className="pi pi-image" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
              <p style={{ marginTop: '1rem' }}>Upload an image to see analysis</p>
            </div>
          )}
        </Card>
      </div>

      {/* Compression Results Section */}
      {compressedResult && (
        <div style={{ marginTop: '2rem' }}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <i className="pi pi-check-circle" style={{ fontSize: '3rem', color: '#10b981' }}></i>
              <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#2d3748' }}>Compression Complete</h2>
              <p style={{ color: '#718096' }}>Review the results and download if satisfied</p>
            </div>

            {/* Compression Stats */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              color: 'white'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Original Size</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatBytes(compressedResult.originalSize)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Compressed Size</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatBytes(compressedResult.compressedSize)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Reduction</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{compressedResult.compressionRatio}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Quality</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{compressedResult.quality}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Format</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{compressedResult.format}</div>
                </div>
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              {/* Original Preview */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
                  <i className="pi pi-file" style={{ marginRight: '0.5rem' }}></i>
                  Original
                </h3>
                <img src={previewUrl!} alt="Original" className="preview-image" style={{ marginBottom: '1rem' }} />
                {originalAnalysis && (
                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                    <div>{originalAnalysis.width} × {originalAnalysis.height}</div>
                    <div>{formatBytes(originalAnalysis.originalSize)}</div>
                  </div>
                )}
              </div>

              {/* Compressed Preview */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
                  <i className="pi pi-check-circle" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                  Compressed
                </h3>
                <img src={compressedResult.imageData} alt="Compressed" className="preview-image" style={{ marginBottom: '1rem' }} />
                {analyzingCompressed ? (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                    <p style={{ marginTop: '0.5rem', color: '#718096', fontSize: '0.875rem' }}>Analyzing...</p>
                  </div>
                ) : compressedAnalysis ? (
                  <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                    <div>{compressedAnalysis.width} × {compressedAnalysis.height}</div>
                    <div>{formatBytes(compressedAnalysis.originalSize)}</div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Detailed Comparison Table */}
            {compressedAnalysis && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
                  <i className="pi pi-table" style={{ marginRight: '0.5rem' }}></i>
                  Detailed Comparison
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: '#4a5568' }}>Property</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: '#4a5568' }}>Original</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: '#4a5568' }}>Compressed</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>File Size</td>
                        <td style={{ padding: '0.75rem' }}>{formatBytes(originalAnalysis.originalSize)}</td>
                        <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 600 }}>{formatBytes(compressedAnalysis.originalSize)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>Dimensions</td>
                        <td style={{ padding: '0.75rem' }}>{originalAnalysis.width} × {originalAnalysis.height}</td>
                        <td style={{ padding: '0.75rem' }}>{compressedAnalysis.width} × {compressedAnalysis.height}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>Bits Per Pixel</td>
                        <td style={{ padding: '0.75rem' }}>{originalAnalysis.bitsPerPixel}</td>
                        <td style={{ padding: '0.75rem' }}>{compressedAnalysis.bitsPerPixel}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>Format</td>
                        <td style={{ padding: '0.75rem' }}>{originalAnalysis.format}</td>
                        <td style={{ padding: '0.75rem' }}>{compressedAnalysis.format}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>Compression Type</td>
                        <td style={{ padding: '0.75rem' }}>{originalAnalysis.compressionType}</td>
                        <td style={{ padding: '0.75rem' }}>{compressedAnalysis.compressionType}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Download Button */}
            <Button
              label="Download Compressed Image"
              icon="pi pi-download"
              onClick={handleDownload}
              className="w-full p-button-lg p-button-success"
              style={{ width: '100%' }}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
