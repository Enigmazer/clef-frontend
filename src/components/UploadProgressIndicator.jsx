import React from 'react';
import { useUploads } from '../context/UploadContext';
import { FileUp, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function UploadProgressIndicator() {
  const { uploads } = useUploads();
  const activeUploads = Object.values(uploads);

  if (activeUploads.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full animate-slide-up">
      {activeUploads.map((upload) => (
        <div 
          key={upload.id} 
          className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-2xl p-4 flex flex-col gap-3 overflow-hidden transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              upload.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
              upload.status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
            }`}>
              {upload.status === 'success' ? <CheckCircle size={18} /> : 
               upload.status === 'error' ? <AlertCircle size={18} /> : 
               <FileUp size={18} className="animate-bounce" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {upload.fileName}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {upload.status === 'success' ? 'Upload complete' : 
                 upload.status === 'error' ? upload.error : 
                 'Uploading content...'}
              </p>
            </div>
          </div>

           {upload.status === 'uploading' && (
            <div className="flex items-center gap-3 w-full mt-1">
              <div className="h-1.5 flex-1 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${upload.progress || 0}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 min-w-[28px] text-right">
                {Math.round(upload.progress || 0)}%
              </span>
            </div>
          )}

          {upload.status === 'success' && (
            <div className="h-1.5 w-full bg-green-500 rounded-full" />
          )}

          {upload.status === 'error' && (
            <div className="h-1.5 w-full bg-red-500 rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
}
