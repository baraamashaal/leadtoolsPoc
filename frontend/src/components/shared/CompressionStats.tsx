import type { FC } from 'react';
import { formatBytes } from '../../utils/formatters';

interface CompressionStatsProps {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  additionalStats?: Record<string, string | number>;
  gradient?: string;
}

export const CompressionStats: FC<CompressionStatsProps> = ({
  originalSize,
  compressedSize,
  compressionRatio,
  additionalStats = {},
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}) => {
  return (
    <div
      style={{
        background: gradient,
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        color: 'white',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Reduction</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{compressionRatio}%</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Original</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatBytes(originalSize)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Compressed</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatBytes(compressedSize)}</div>
        </div>
        {Object.entries(additionalStats).map(([key, value]) => (
          <div key={key}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{key}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
