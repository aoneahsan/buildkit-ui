import { useContext, createContext, useRef } from 'react';
import { ToastRef, ToastMessage } from './Toast';

const ToastContext = createContext<ToastRef | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ToastContext.Provider;

// Helper hook for common toast patterns
export const useToastHelpers = () => {
  const toast = useToast();

  return {
    showSuccess: (summary: string, detail?: string, life?: number) => {
      toast.show({
        severity: 'success',
        summary,
        detail,
        life: life || 3000
      });
    },
    showError: (summary: string, detail?: string, sticky?: boolean) => {
      toast.show({
        severity: 'error',
        summary,
        detail,
        sticky: sticky ?? true
      });
    },
    showInfo: (summary: string, detail?: string, life?: number) => {
      toast.show({
        severity: 'info',
        summary,
        detail,
        life: life || 3000
      });
    },
    showWarning: (summary: string, detail?: string, life?: number) => {
      toast.show({
        severity: 'warn',
        summary,
        detail,
        life: life || 5000
      });
    },
    clear: () => toast.clear()
  };
};