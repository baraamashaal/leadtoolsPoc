import { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { imageApi, pdfApi, ImageAnalysis, CompressionResult, PdfAnalysis, PdfCompressionResult } from './services/api';

function App() {
  // Image compression state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [originalAnalysis, setOriginalAnalysis] = useState<ImageAnalysis | null>(null);
  const [compressedAnalysis, setCompressedAnalysis] = useState<ImageAnalysis | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingCompressed, setAnalyzingCompressed] = useState(false);

  // PDF compression state
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfAnalysis, setPdfAnalysis] = useState<PdfAnalysis | null>(null);
  const [pdfCompressedResult, setPdfCompressedResult] = useState<PdfCompressionResult | null>(null);
  const [pdfQualityMode, setPdfQualityMode] = useState<string>('Balanced');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfAnalyzing, setPdfAnalyzing] = useState(false);

  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const pdfUploadRef = useRef<FileUpload>(null);

  const qualityModes = [
    { label: 'Best Quality', value: 'BestQuality' },
    { label: 'Balanced', value: 'Balanced' },
    { label: 'Best Size', value: 'BestSize' },
  ];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Image handlers
  const handleFileSelect = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    if (!file) return;

    setSelectedFile(file);
    setCompressedResult(null);
    setOriginalAnalysis(null);
    setCompressedAnalysis(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

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
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'compressed.jpg', { type: 'image/jpeg' });

      const result = await imageApi.analyzeImage(file);
      setCompressedAnalysis(result);
    } catch (error) {
      console.error('Error analyzing compressed image:', error);
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

  // PDF handlers
  const handlePdfSelect = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    if (!file) return;

    setSelectedPdf(file);
    setPdfCompressedResult(null);
    setPdfAnalysis(null);

    await handlePdfAnalyze(file);
  };

  const handlePdfAnalyze = async (file?: File) => {
    const targetFile = file || selectedPdf;
    if (!targetFile) return;

    setPdfAnalyzing(true);
    try {
      const result = await pdfApi.analyzePdf(targetFile);
      setPdfAnalysis(result);
      toast.current?.show({
        severity: 'success',
        summary: 'Analysis Complete',
        detail: 'PDF analyzed successfully',
        life: 3000,
      });
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to analyze PDF',
        life: 3000,
      });
    } finally {
      setPdfAnalyzing(false);
    }
  };

  const handlePdfCompress = async () => {
    if (!selectedPdf) return;

    setPdfLoading(true);
    try {
      const result = await pdfApi.compressPdf(selectedPdf, pdfQualityMode);
      setPdfCompressedResult(result);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'PDF compressed successfully with MRC technology',
        life: 3000,
      });
    } catch (error) {
      console.error('Error compressing PDF:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to compress PDF',
        life: 3000,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePdfDownload = () => {
    if (!pdfCompressedResult) return;

    const a = document.createElement('a');
    a.href = pdfCompressedResult.pdfData;
    a.download = pdfCompressedResult.fileName;
    a.click();

    toast.current?.show({
      severity: 'success',
      summary: 'Downloaded',
      detail: 'Compressed PDF downloaded successfully',
      life: 3000,
    });
  };

  return (
    <div className="app-container">
      <Toast ref={toast} />

      <div className="header">
        <h1>🚀 LEADTOOLS Compression Suite</h1>
        <p>Professional-grade compression powered by LEADTOOLS SDK with advanced MRC technology</p>
      </div>

      <TabView>
        {/* IMAGE COMPRESSION TAB */}
        <TabPanel header="Image Compression" leftIcon="pi pi-image">
          <div className="main-grid">
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

            <Card>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <i className="pi pi-chart-bar" style={{ fontSize: '3rem', color: '#667eea' }}></i>
                <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Image Analysis</h2>
                <p style={{ color: '#718096' }}>Detailed information about your image</p>
              </div>

              {analyzing ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                  <p style={{ marginTop: '1rem', color: '#718096' }}>Analyzing...</p>
                </div>
              ) : originalAnalysis ? (
                <div className="info-grid">
                  <div className="info-item">
                    <label>File Size</label>
                    <div className="value">{formatBytes(originalAnalysis.originalSize)}</div>
                  </div>
                  <div className="info-item">
                    <label>Dimensions</label>
                    <div className="value">{originalAnalysis.width} × {originalAnalysis.height}</div>
                  </div>
                  <div className="info-item">
                    <label>Format</label>
                    <div className="value">{originalAnalysis.format}</div>
                  </div>
                  <div className="info-item">
                    <label>Bits Per Pixel</label>
                    <div className="value">{originalAnalysis.bitsPerPixel}</div>
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

          {compressedResult && (
            <div style={{ marginTop: '2rem' }}>
              <Card>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <i className="pi pi-check-circle" style={{ fontSize: '3rem', color: '#10b981' }}></i>
                  <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Compression Complete</h2>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  color: 'white'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Reduction</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{compressedResult.compressionRatio}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Original</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatBytes(compressedResult.originalSize)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Compressed</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatBytes(compressedResult.compressedSize)}</div>
                    </div>
                  </div>
                </div>

                <Button
                  label="Download Compressed Image"
                  icon="pi pi-download"
                  onClick={handleDownload}
                  className="w-full p-button-success"
                  style={{ width: '100%' }}
                />
              </Card>
            </div>
          )}
        </TabPanel>

        {/* PDF COMPRESSION TAB */}
        <TabPanel header="PDF Compression (MRC)" leftIcon="pi pi-file-pdf">
          <div className="main-grid">
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <i className="pi pi-cloud-upload" style={{ fontSize: '3rem', color: '#dc2626' }}></i>
                <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Upload PDF</h2>
                <p style={{ color: '#718096' }}>Select a PDF to compress with MRC technology</p>
              </div>

              <FileUpload
                ref={pdfUploadRef}
                name="file"
                accept=".pdf"
                maxFileSize={50000000}
                customUpload
                uploadHandler={handlePdfSelect}
                auto
                chooseLabel="Select PDF"
                className="mb-3"
              />

              {selectedPdf && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{
                    padding: '2rem',
                    background: '#fef2f2',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <i className="pi pi-file-pdf" style={{ fontSize: '4rem', color: '#dc2626' }}></i>
                    <p style={{ marginTop: '1rem', fontWeight: 600, color: '#1f2937' }}>{selectedPdf.name}</p>
                  </div>

                  <Divider />

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Quality Mode
                    </label>
                    <Dropdown
                      value={pdfQualityMode}
                      options={qualityModes}
                      onChange={(e) => setPdfQualityMode(e.value)}
                      style={{ width: '100%' }}
                    />
                    <small style={{ color: '#718096', display: 'block', marginTop: '0.5rem' }}>
                      Uses advanced MRC (Mixed Raster Content) segmentation
                    </small>
                  </div>

                  <Button
                    label="Compress PDF with MRC"
                    icon="pi pi-compress"
                    onClick={handlePdfCompress}
                    disabled={pdfLoading}
                    loading={pdfLoading}
                    className="w-full p-button-lg p-button-danger"
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </Card>

            <Card>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <i className="pi pi-info-circle" style={{ fontSize: '3rem', color: '#dc2626' }}></i>
                <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>PDF Analysis</h2>
                <p style={{ color: '#718096' }}>Detailed information about your PDF</p>
              </div>

              {pdfAnalyzing ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                  <p style={{ marginTop: '1rem', color: '#718096' }}>Analyzing PDF...</p>
                </div>
              ) : pdfAnalysis ? (
                <div className="info-grid">
                  <div className="info-item">
                    <label>File Size</label>
                    <div className="value">{formatBytes(pdfAnalysis.fileSize)}</div>
                  </div>
                  <div className="info-item">
                    <label>Pages</label>
                    <div className="value">{pdfAnalysis.pageCount}</div>
                  </div>
                  <div className="info-item">
                    <label>Version</label>
                    <div className="value">{pdfAnalysis.version}</div>
                  </div>
                  <div className="info-item">
                    <label>Linearized</label>
                    <div className="value">{pdfAnalysis.isLinearized ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#a0aec0' }}>
                  <i className="pi pi-file-pdf" style={{ fontSize: '3rem', opacity: 0.5 }}></i>
                  <p style={{ marginTop: '1rem' }}>Upload a PDF to see analysis</p>
                </div>
              )}
            </Card>
          </div>

          {pdfCompressedResult && (
            <div style={{ marginTop: '2rem' }}>
              <Card>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <i className="pi pi-check-circle" style={{ fontSize: '3rem', color: '#10b981' }}></i>
                  <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>PDF Compression Complete</h2>
                  <p style={{ color: '#718096' }}>
                    <i className="pi pi-sparkles" style={{ marginRight: '0.5rem' }}></i>
                    Compressed with MRC Technology
                  </p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  color: 'white'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Reduction</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pdfCompressedResult.compressionRatio}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Original</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatBytes(pdfCompressedResult.originalSize)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Compressed</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatBytes(pdfCompressedResult.compressedSize)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Pages</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{pdfCompressedResult.pageCount}</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#ecfdf5',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  border: '1px solid #10b981'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                    <i className="pi pi-info-circle"></i>
                    <strong>MRC Segmentation Applied</strong>
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#047857' }}>
                    This PDF was compressed using advanced Mixed Raster Content technology,
                    intelligently segmenting text, images, and graphics for optimal compression.
                  </p>
                </div>

                <Button
                  label="Download Compressed PDF"
                  icon="pi pi-download"
                  onClick={handlePdfDownload}
                  className="w-full p-button-success"
                  style={{ width: '100%' }}
                />
              </Card>
            </div>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
}

export default App;
