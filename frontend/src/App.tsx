import { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { imageApi, ImageAnalysis } from './services/api';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
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
    setCompressedUrl(null);
    setAnalysis(null);

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
      setAnalysis(result);
      toast.current?.show({
        severity: 'success',
        summary: 'Analysis Complete',
        detail: 'Image analyzed successfully',
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

  const handleCompress = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const { blob, filename } = await imageApi.compressImage(selectedFile, quality);

      // Create URL for compressed image
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);

      // Auto-download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Image compressed and downloaded',
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

  const uploadHeader = (
    <div className="header">
      <i className="pi pi-upload"></i>
      <h3>Upload Image</h3>
    </div>
  );

  const analysisHeader = (
    <div className="header">
      <i className="pi pi-info-circle"></i>
      <h3>Image Analysis</h3>
    </div>
  );

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
                label="Compress & Download"
                icon="pi pi-download"
                onClick={handleCompress}
                disabled={loading}
                loading={loading}
                className="w-full p-button-lg p-button-success"
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
              <p style={{ marginTop: '1rem', color: '#718096' }}>Analyzing image...</p>
            </div>
          ) : analysis ? (
            <div>
              <div className="info-grid">
                <div className="info-item">
                  <label>File Name</label>
                  <div className="value" title={analysis.fileName}>
                    {analysis.fileName.length > 20
                      ? analysis.fileName.substring(0, 20) + '...'
                      : analysis.fileName}
                  </div>
                </div>
                <div className="info-item">
                  <label>File Size</label>
                  <div className="value">{formatBytes(analysis.originalSize)}</div>
                </div>
                <div className="info-item">
                  <label>Dimensions</label>
                  <div className="value">
                    {analysis.width} × {analysis.height}
                  </div>
                </div>
                <div className="info-item">
                  <label>Bits Per Pixel</label>
                  <div className="value">{analysis.bitsPerPixel}</div>
                </div>
                <div className="info-item">
                  <label>Format</label>
                  <div className="value">{analysis.format}</div>
                </div>
                <div className="info-item">
                  <label>Compression Type</label>
                  <div className="value">{analysis.compressionType}</div>
                </div>
              </div>

              {compressedUrl && (
                <div style={{ marginTop: '2rem' }}>
                  <Divider />
                  <h3 style={{ marginBottom: '1rem' }}>
                    <i className="pi pi-check-circle" style={{ color: '#10b981', marginRight: '0.5rem' }}></i>
                    Compressed Preview
                  </h3>
                  <img src={compressedUrl} alt="Compressed" className="preview-image" />
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#a0aec0' }}>
              <i className="pi pi-image" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
              <p style={{ marginTop: '1rem' }}>Upload an image to see analysis</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default App;
