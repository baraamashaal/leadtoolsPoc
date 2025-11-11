/**
 * Application configuration constants
 */

export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 60000, // 60 seconds
} as const;

export const FILE_UPLOAD_CONFIG = {
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ACCEPTED_TYPES: ['image/*'],
    ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
  },
  PDF: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ACCEPTED_TYPES: ['.pdf'],
    ACCEPTED_EXTENSIONS: ['.pdf'],
  },
} as const;

export const QUALITY_MODES = [
  { label: 'Best Quality', value: 'BestQuality' },
  { label: 'Balanced', value: 'Balanced' },
  { label: 'Best Size', value: 'BestSize' },
];

export const TOAST_DURATION = 3000;
