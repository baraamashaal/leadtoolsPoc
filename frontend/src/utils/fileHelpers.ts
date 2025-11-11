/**
 * Utility functions for file operations
 */

export const downloadFile = (dataUrl: string, fileName: string): void => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  a.click();
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const dataUrlToFile = async (dataUrl: string, fileName: string, mimeType: string): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type);
    }
    return file.type.match(type) !== null;
  });
};
