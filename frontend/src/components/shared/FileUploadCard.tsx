import type { FC, RefObject } from 'react';
import { Card } from 'primereact/card';
import { FileUpload, type FileUploadHandlerEvent } from 'primereact/fileupload';

interface FileUploadCardProps {
  title: string;
  icon: string;
  iconColor: string;
  description: string;
  acceptedTypes: string;
  maxFileSize: number;
  fileUploadRef: RefObject<FileUpload>;
  onUpload: (event: FileUploadHandlerEvent) => void;
  chooseLabel?: string;
}

export const FileUploadCard: FC<FileUploadCardProps> = ({
  title,
  icon,
  iconColor,
  description,
  acceptedTypes,
  maxFileSize,
  fileUploadRef,
  onUpload,
  chooseLabel = 'Select File',
}) => {
  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <i className={icon} style={{ fontSize: '3rem', color: iconColor }}></i>
        <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: '#718096' }}>{description}</p>
      </div>

      <FileUpload
        ref={fileUploadRef}
        name="file"
        accept={acceptedTypes}
        maxFileSize={maxFileSize}
        customUpload
        uploadHandler={onUpload}
        auto
        chooseLabel={chooseLabel}
        className="mb-3"
      />
    </Card>
  );
};
