import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import type { FC } from 'react';

interface AnalysisItem {
  label: string;
  value: string | number;
}

interface FileAnalysisCardProps {
  title: string;
  icon: string;
  iconColor: string;
  description: string;
  analyzing: boolean;
  analysisData: AnalysisItem[] | null;
  emptyStateIcon: string;
  emptyStateMessage: string;
}

export const FileAnalysisCard: FC<FileAnalysisCardProps> = ({
  title,
  icon,
  iconColor,
  description,
  analyzing,
  analysisData,
  emptyStateIcon,
  emptyStateMessage,
}) => {
  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <i className={icon} style={{ fontSize: '3rem', color: iconColor }}></i>
        <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: '#718096' }}>{description}</p>
      </div>

      {analyzing ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
          <p style={{ marginTop: '1rem', color: '#718096' }}>Analyzing...</p>
        </div>
      ) : analysisData ? (
        <div className="info-grid">
          {analysisData.map((item, index) => (
            <div key={index} className="info-item">
              <label>{item.label}</label>
              <div className="value">{item.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#a0aec0' }}>
          <i className={emptyStateIcon} style={{ fontSize: '3rem', opacity: 0.5 }}></i>
          <p style={{ marginTop: '1rem' }}>{emptyStateMessage}</p>
        </div>
      )}
    </Card>
  );
};
