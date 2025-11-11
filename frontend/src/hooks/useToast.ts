import { useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ToastMessage } from '../types';
import { TOAST_DURATION } from '../constants/config';

export const useToast = () => {
  const toast = useRef<Toast>(null);

  const showToast = (message: ToastMessage) => {
    toast.current?.show({
      ...message,
      life: message.life || TOAST_DURATION,
    });
  };

  const showSuccess = (summary: string, detail: string) => {
    showToast({ severity: 'success', summary, detail });
  };

  const showError = (summary: string, detail: string) => {
    showToast({ severity: 'error', summary, detail });
  };

  const showInfo = (summary: string, detail: string) => {
    showToast({ severity: 'info', summary, detail });
  };

  const showWarning = (summary: string, detail: string) => {
    showToast({ severity: 'warn', summary, detail });
  };

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
