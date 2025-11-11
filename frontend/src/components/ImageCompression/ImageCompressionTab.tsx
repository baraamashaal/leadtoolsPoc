import type { FC } from 'react';
import { useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Slider } from 'primereact/slider';
import { Divider } from 'primereact/divider';
import { FileUpload, type FileUploadHandlerEvent } from 'primereact/fileupload';
import { useImageCompression } from '../../hooks/useImageCompression';
import { FileAnalysisCard } from '../shared/FileAnalysisCard';
import { CompressionStats } from '../shared/CompressionStats';
import { formatBytes, truncateFileName } from '../../utils/formatters';
import { fileToDataUrl, downloadFile } from '../../utils/fileHelpers';
import { FILE_UPLOAD_CONFIG } from '../../constants/config';

interface ImageCompressionTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const ImageCompressionTab: FC<ImageCompressionTabProps> = ({ onSuccess, onError }) => {
  const fileUploadRef = useRef<FileUpload>(null);
  const [quality, setQuality] = useState(75);

  const {
    selectedFile,
    setSelectedFile,
    previewUrl,
    setPreviewUrl,
    compressedResult,
    originalAnalysis,
    compressedAnalysis,
    loading,
    analyzing,
    analyzeImage,
    compressImage,
  } = useImageCompression();

  const handleFileSelect = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      const dataUrl = await fileToDataUrl(file);
      setPreviewUrl(dataUrl);
      await analyzeImage(file);
      onSuccess('Image analyzed successfully');
    } catch (error) {
      onError('Failed to analyze image');
    }
  };

  const handleCompress = async () => {
    try {
      await compressImage(quality);
      onSuccess('Image compressed successfully');
    } catch (error) {
      onError('Failed to compress image');
    }
  };

  const handleDownload = () => {
    if (!compressedResult) return;
    downloadFile(compressedResult.imageData, compressedResult.fileName);
    onSuccess('Compressed image downloaded successfully');
  };

  const getAnalysisData = () => {
    if (!originalAnalysis) return null;
    return [
      { label: 'File Size', value: formatBytes(originalAnalysis.originalSize) },
      { label: 'Dimensions', value: `${originalAnalysis.width} × ${originalAnalysis.height}` },
      { label: 'Format', value: originalAnalysis.format },
      { label: 'Bits Per Pixel', value: originalAnalysis.bitsPerPixel },
    ];
  };

  return (
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
          accept={FILE_UPLOAD_CONFIG.IMAGE.ACCEPTED_TYPES[0]}
          maxFileSize={FILE_UPLOAD_CONFIG.IMAGE.MAX_SIZE}
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

      <FileAnalysisCard
        title="Image Analysis"
        icon="pi pi-chart-bar"
        iconColor="#667eea"
        description="Detailed information about your image"
        analyzing={analyzing}
        analysisData={getAnalysisData()}
        emptyStateIcon="pi pi-image"
        emptyStateMessage="Upload an image to see analysis"
      />

      {compressedResult && (
        <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <i className="pi pi-check-circle" style={{ fontSize: '3rem', color: '#10b981' }}></i>
              <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Compression Complete</h2>
            </div>

            <CompressionStats
              originalSize={compressedResult.originalSize}
              compressedSize={compressedResult.compressedSize}
              compressionRatio={compressedResult.compressionRatio}
              additionalStats={{
                Quality: `${compressedResult.quality}%`,
                Format: compressedResult.format,
              }}
            />

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
    </div>
  );
};
