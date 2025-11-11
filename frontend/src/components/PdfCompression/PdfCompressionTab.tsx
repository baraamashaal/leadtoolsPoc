import type { FC } from 'react';
import { useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload, type FileUploadHandlerEvent } from 'primereact/fileupload';
import { usePdfCompression } from '../../hooks/usePdfCompression';
import { FileAnalysisCard } from '../shared/FileAnalysisCard';
import { CompressionStats } from '../shared/CompressionStats';
import { formatBytes } from '../../utils/formatters';
import { downloadFile } from '../../utils/fileHelpers';
import { FILE_UPLOAD_CONFIG, QUALITY_MODES } from '../../constants/config';
import type {QualityMode} from '../../types';

interface PdfCompressionTabProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const PdfCompressionTab: FC<PdfCompressionTabProps> = ({ onSuccess, onError }) => {
  const pdfUploadRef = useRef<FileUpload>(null);
  const [qualityMode, setQualityMode] = useState<QualityMode>('Balanced');

  const {
    selectedPdf,
    setSelectedPdf,
    pdfAnalysis,
    compressedResult,
    loading,
    analyzing,
    analyzePdf,
    compressPdf,
  } = usePdfCompression();

  const handlePdfSelect = async (event: FileUploadHandlerEvent) => {
    const file = event.files[0];
    if (!file) return;

    setSelectedPdf(file);

    try {
      await analyzePdf(file);
      onSuccess('PDF analyzed successfully');
    } catch (error) {
      onError('Failed to analyze PDF');
    }
  };

  const handlePdfCompress = async () => {
    try {
      await compressPdf(qualityMode);
      onSuccess('PDF compressed successfully with MRC technology');
    } catch (error) {
      onError('Failed to compress PDF');
    }
  };

  const handleDownload = () => {
    if (!compressedResult) return;
    downloadFile(compressedResult.pdfData, compressedResult.fileName);
    onSuccess('Compressed PDF downloaded successfully');
  };

  const getAnalysisData = () => {
    if (!pdfAnalysis) return null;
    return [
      { label: 'File Size', value: formatBytes(pdfAnalysis.fileSize) },
      { label: 'Pages', value: pdfAnalysis.pageCount },
      { label: 'Version', value: pdfAnalysis.version },
      { label: 'Linearized', value: pdfAnalysis.isLinearized ? 'Yes' : 'No' },
    ];
  };

  return (
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
          accept={FILE_UPLOAD_CONFIG.PDF.ACCEPTED_TYPES[0]}
          maxFileSize={FILE_UPLOAD_CONFIG.PDF.MAX_SIZE}
          customUpload
          uploadHandler={handlePdfSelect}
          auto
          chooseLabel="Select PDF"
          className="mb-3"
        />

        {selectedPdf && (
          <div style={{ marginTop: '1.5rem' }}>
            <div
              style={{
                padding: '2rem',
                background: '#fef2f2',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <i className="pi pi-file-pdf" style={{ fontSize: '4rem', color: '#dc2626' }}></i>
              <p style={{ marginTop: '1rem', fontWeight: 600, color: '#1f2937' }}>{selectedPdf.name}</p>
            </div>

            <Divider />

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quality Mode</label>
              <Dropdown
                value={qualityMode}
                options={QUALITY_MODES}
                onChange={(e) => setQualityMode(e.value)}
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
              disabled={loading}
              loading={loading}
              className="w-full p-button-lg p-button-danger"
              style={{ width: '100%' }}
            />
          </div>
        )}
      </Card>

      <FileAnalysisCard
        title="PDF Analysis"
        icon="pi pi-info-circle"
        iconColor="#dc2626"
        description="Detailed information about your PDF"
        analyzing={analyzing}
        analysisData={getAnalysisData()}
        emptyStateIcon="pi pi-file-pdf"
        emptyStateMessage="Upload a PDF to see analysis"
      />

      {compressedResult && (
        <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <i className="pi pi-check-circle" style={{ fontSize: '3rem', color: '#10b981' }}></i>
              <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>PDF Compression Complete</h2>
              <p style={{ color: '#718096' }}>
                <i className="pi pi-sparkles" style={{ marginRight: '0.5rem' }}></i>
                Compressed with MRC Technology
              </p>
            </div>

            <CompressionStats
              originalSize={compressedResult.originalSize}
              compressedSize={compressedResult.compressedSize}
              compressionRatio={compressedResult.compressionRatio}
              additionalStats={{
                Pages: compressedResult.pageCount,
              }}
              gradient="linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
            />

            <div
              style={{
                background: '#ecfdf5',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                border: '1px solid #10b981',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <i className="pi pi-info-circle"></i>
                <strong>MRC Segmentation Applied</strong>
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#047857' }}>
                This PDF was compressed using advanced Mixed Raster Content technology, intelligently segmenting
                text, images, and graphics for optimal compression.
              </p>
            </div>

            <Button
              label="Download Compressed PDF"
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
