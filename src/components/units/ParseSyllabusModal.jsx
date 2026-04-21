import { useState, useRef, useEffect, useCallback, startTransition } from 'react'
import { AlertCircle, X, Sparkles, FileText, Upload, ChevronRight as ChevronRightIcon, Shield } from 'lucide-react'
import { useUploadSyllabus, useParseSyllabus } from '../../hooks/useSubjects'

// Stages: 'choose' | 'uploading' | 'parsing'
export default function ParseSyllabusModal({ isOpen, onClose, subject, onParsed }) {
  const hasPdf = !!subject?.isSyllabusPdfAvailable

  const [canGoToChoose, setCanGoToChoose] = useState(hasPdf)
  const [stage, setStage] = useState(hasPdf ? 'choose' : 'uploading')
  const [parseError, setParseError] = useState('')

  const fileInputRef = useRef(null)

  const uploadSyllabusMutation = useUploadSyllabus(subject?.id)
  const parseMutation = useParseSyllabus(subject?.id)

  const isBlocked = stage === 'parsing'

  useEffect(() => {
    if (isOpen) {
      const initialHasPdf = !!subject?.isSyllabusPdfAvailable
      startTransition(() => {
        setCanGoToChoose(initialHasPdf)
        setStage(initialHasPdf ? 'choose' : 'uploading')
        setParseError('')
      })
    }
  }, [isOpen, subject?.isSyllabusPdfAvailable])

  useEffect(() => {
    if (!isBlocked) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isBlocked])

  const runParse = useCallback(async () => {
    setStage('parsing')
    setParseError('')
    try {
      const result = await parseMutation.mutateAsync()
      if (!result || result.length === 0) {
        setParseError("Couldn't extract any units from this PDF. The file may not have a structured syllabus or the syllabus is alredy extracted from this file and it have no new units. Try a different PDF or add units manually.")
        setStage(canGoToChoose ? 'choose' : 'uploading')
        return
      }
      const drafts = result.map((unit) => ({
        title: unit.title,
        topics: (unit.topics ?? []).map(t => ({ title: t.title })),
      }))
      onParsed(drafts)
      onClose()
    } catch (err) {
      setParseError(err?.response?.data?.message ?? 'Failed to parse the syllabus. Please try again.')
      setStage(canGoToChoose ? 'choose' : 'uploading')
    }
  }, [parseMutation, canGoToChoose, onParsed, onClose])

  const handleFileSelected = useCallback(async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setParseError('Only PDF files are supported.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setParseError('File size must be 2MB or less.')
      return
    }
    setParseError('')
    try {
      await uploadSyllabusMutation.mutateAsync(file)
      setCanGoToChoose(true)
      setStage('choose')
    } catch (err) {
      setParseError(err?.response?.data?.message ?? 'Upload failed. Please try again.')
    }
    if (fileInputRef.current) fileInputRef.current.value = null
  }, [uploadSyllabusMutation])

  const safeClose = () => {
    if (isBlocked) return
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={safeClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Parse Syllabus"
        className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-zoom-in"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Sparkles size={15} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                Parse Syllabus from PDF
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                {stage === 'uploading' && 'Upload a syllabus PDF'}
                {stage === 'parsing' && 'AI is reading your PDF…'}
                {stage === 'choose' && 'Choose an action'}
              </p>
            </div>
          </div>
          {!isBlocked && (
            <button
              onClick={safeClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-[#2a2a2a] dark:hover:bg-[#333] p-1.5 rounded-full"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Error banner */}
          {parseError && (
                <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 px-5 py-3 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span className="flex-1">{parseError}</span>
              <button onClick={() => setParseError('')}><X size={13} className="opacity-50 hover:opacity-100" /></button>
            </div>
          )}

          {/* STAGE: choose */}
          {stage === 'choose' && (
            <div className="p-5 space-y-3">
              {/* Parse PDF */}
              <button
                onClick={runParse}
                className="w-full flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/40 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
                  <FileText size={18} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Parse PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Extract units and topics using AI</p>
                </div>
                <ChevronRightIcon size={16} className="text-gray-400 shrink-0" />
              </button>

              {/* Upload / replace PDF */}
              <button
                onClick={() => setStage('uploading')}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#2a2a2a] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-[#333] transition-colors">
                  <Upload size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Upload a PDF</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upload or replace the syllabus PDF, then parse it</p>
                </div>
                <ChevronRightIcon size={16} className="text-gray-400 shrink-0" />
              </button>
            </div>
          )}

          {/* STAGE: uploading */}
          {stage === 'uploading' && (
            <div className="p-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files?.[0])}
              />
              {uploadSyllabusMutation.isPending ? (
                <div className="py-8 flex flex-col items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <div className="w-7 h-7 border-2 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Uploading PDF…</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Please wait</p>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-[#333] hover:border-green-400 dark:hover:border-green-600 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-[#2a2a2a] group-hover:bg-green-100 dark:group-hover:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                      <Upload size={20} className="text-gray-400 group-hover:text-green-500 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                      Click to select a PDF
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Maximum 2MB</p>
                  </div>
                  {canGoToChoose && (
                    <button
                      onClick={() => setStage('choose')}
                      className="mt-4 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-center"
                    >
                      ← Back
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STAGE: parsing — rich animation */}
          {stage === 'parsing' && (
            <div className="p-6 py-8 flex flex-col items-center gap-6">
              <div className="relative w-full flex items-center justify-center gap-4" style={{ height: 120 }}>
                {/* PDF Document */}
                <div className="flex flex-col items-center gap-1 animate-[bounce_2s_ease-in-out_infinite]">
                  <div className="w-14 h-16 bg-white dark:bg-[#2a2a2a] border-2 border-green-300 dark:border-green-700 rounded-lg shadow-lg flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-100 dark:bg-green-900/60 border-l-2 border-b-2 border-green-300 dark:border-green-700 rounded-bl-sm" />
                    <div className="flex-1 p-2 pt-3 space-y-1">
                      <div className="h-1.5 bg-green-200 dark:bg-green-800 rounded-full w-full" />
                      <div className="h-1.5 bg-gray-200 dark:bg-[#333] rounded-full w-4/5" />
                      <div className="h-1.5 bg-gray-200 dark:bg-[#333] rounded-full w-full" />
                      <div className="h-1.5 bg-gray-200 dark:bg-[#333] rounded-full w-3/4" />
                    </div>
                    <div className="px-2 pb-2">
                      <div className="text-[7px] font-bold text-green-600 dark:text-green-400 tracking-wider">PDF</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Syllabus</span>
                </div>

                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-500"
                      style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>

                {/* AI Parser */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 bg-green-500 dark:bg-green-600 rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ animation: 'shimmer 1.8s ease-in-out infinite' }} />
                    <Sparkles size={22} className="text-white relative z-10" />
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">AI Parser</span>
                </div>

                <div className="flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-500"
                      style={{ animation: `pulse 1.2s ease-in-out ${0.4 + i * 0.2}s infinite` }} />
                  ))}
                </div>

                {/* Output card */}
                <div className="flex flex-col items-start gap-1 animate-[bounce_2.4s_ease-in-out_infinite]">
                  <div className="w-16 h-16 bg-white dark:bg-[#2a2a2a] border-2 border-green-300 dark:border-green-700 rounded-lg shadow-lg p-2 space-y-1.5 overflow-hidden">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-sm bg-green-400 dark:bg-green-500 shrink-0" />
                      <div className="h-1.5 bg-green-300 dark:bg-green-700 rounded-full flex-1" style={{ animation: 'typeWidth 2s ease-out infinite' }} />
                    </div>
                    {[0.3, 0.5, 0.8, 1.0].map((w, i) => (
                      <div key={i} className="flex items-center gap-1 pl-2">
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                        <div className="h-1 bg-gray-200 dark:bg-[#444] rounded-full"
                          style={{ width: `${w * 100}%`, animation: `typeWidth 2s ease-out ${0.2 + i * 0.15}s infinite` }} />
                      </div>
                    ))}
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 rounded-sm bg-green-400 dark:bg-green-500 shrink-0" />
                      <div className="h-1.5 bg-green-300 dark:bg-green-700 rounded-full" style={{ width: '70%', animation: 'typeWidth 2s ease-out 1s infinite' }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">Units &amp; Topics</span>
                </div>
              </div>

              <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                @keyframes typeWidth { 0%, 30% { width: 0%; opacity: 0; } 60%, 80% { opacity: 1; } 100% { opacity: 0.6; } }
              `}</style>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Analysing your syllabus…</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  Extracting units and topics from the PDF. This may take a moment.
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center justify-center gap-1">
                  <Shield size={11} />
                  Please don't close or navigate away
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
