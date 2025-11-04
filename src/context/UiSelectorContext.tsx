import { createContext, useContext, useState, ReactNode } from 'react';

export interface ElementMetadata {
  componentName: string;
  filePath: string;
  lineRange: { start: number; end: number };
  codeSnippet: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface UiSelectorContextType {
  selectedElement: ElementMetadata | null;
  userPrompt: string;
  isSelectionMode: boolean;
  toasts: ToastMessage[];
  showToasts: boolean;
  setSelectedElement: (element: ElementMetadata | null) => void;
  setUserPrompt: (prompt: string) => void;
  setSelectionMode: (mode: boolean) => void;
  setShowToasts: (enabled: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UiSelectorContext = createContext<UiSelectorContextType | undefined>(undefined);

export const UiSelectorProvider = ({ children }: { children: ReactNode }) => {
  const [selectedElement, setSelectedElement] = useState<ElementMetadata | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isSelectionMode, setSelectionMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showToasts, setShowToasts] = useState<boolean>(true);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (!showToasts) return; // respect user preference
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleSetShowToasts = (enabled: boolean) => {
    setShowToasts(enabled);
    if (!enabled) {
      // clear existing toasts when disabled
      setToasts([]);
    }
  };

  return (
    <UiSelectorContext.Provider
      value={{
        selectedElement,
        userPrompt,
        isSelectionMode,
        toasts,
        showToasts,
        setSelectedElement,
        setUserPrompt,
        setSelectionMode,
        setShowToasts: handleSetShowToasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </UiSelectorContext.Provider>
  );
};

export const useUiSelector = () => {
  const context = useContext(UiSelectorContext);
  if (context === undefined) {
    throw new Error('useUiSelector must be used within a UiSelectorProvider');
  }
  return context;
};

