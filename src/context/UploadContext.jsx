/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

const UploadContext = createContext(null);

export const useUploads = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUploads must be used within an UploadProvider');
  }
  return context;
};

export const UploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState({});

  const startUpload = useCallback((id, fileName) => {
    setUploads((prev) => ({
      ...prev,
      [id]: { id, fileName, progress: 0, status: 'uploading', error: null },
    }));
  }, []);

  const updateProgress = useCallback((id, progress) => {
    setUploads((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], progress },
      };
    });
  }, []);

  const completeUpload = useCallback((id) => {
    setUploads((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], progress: 100, status: 'success' },
      };
    });
    setTimeout(() => {
      setUploads((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 4000);
  }, []);

  const failUpload = useCallback((id, error) => {
    setUploads((prev) => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], status: 'error', error },
      };
    });
    setTimeout(() => {
      setUploads((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 8000);
  }, []);

  return (
    <UploadContext.Provider value={{ uploads, startUpload, updateProgress, completeUpload, failUpload }}>
      {children}
    </UploadContext.Provider>
  );
};
