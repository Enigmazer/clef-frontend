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
            <div className="p-8 flex flex-col items-center gap-10">
              <div className="relative w-full flex items-center justify-center gap-2 sm:gap-3" style={{ height: 140 }}>
                {/* PDF Document */}
                <div className="flex flex-col items-center gap-3 z-10" style={{ animation: 'floatItem 3.5s ease-in-out infinite' }}>
                  <div className="w-16 h-20 bg-white dark:bg-[#1a1a1a] border border-green-500/20 dark:border-green-500/30 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.15)] flex flex-col overflow-hidden relative">
                    <div className="absolute left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)] z-20" style={{ animation: 'scanMove 2.5s ease-in-out infinite' }} />
                    <div className="absolute top-0 right-0 w-5 h-5 bg-green-50 dark:bg-green-900/20 border-l border-b border-green-500/20 rounded-bl-md" />
                    <div className="flex-1 p-2 pt-3.5 flex flex-col gap-1.5 opacity-70">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5" />
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6" />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full z-10">Syllabus.pdf</span>
                </div>

                {/* Data stream 1 */}
                <div className="relative w-8 sm:w-12 h-6 flex items-center overflow-hidden shrink-0">
                  <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
                  {[0, 1, 2].map(i => (
                    <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]"
                      style={{ left: '-10px', animation: `dataFlow 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.4}s infinite` }} />
                  ))}
                </div>

                {/* AI Core */}
                <div className="flex flex-col items-center gap-3 z-20" style={{ animation: 'floatItemDelay 4s ease-in-out infinite' }}>
                  <div className="w-16 h-16 rounded-2xl bg-green-500 dark:bg-green-600 shadow-[0_0_25px_rgba(34,197,94,0.6)]" style={{ animation: 'pulseGlow 2s infinite' }}>
                    <div className="w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                      <div className="absolute inset-x-[-10px] inset-y-[-10px] border-[1.5px] border-white/30 rounded-full" style={{ animation: 'spinSlow 4s linear infinite' }}>
                        <div className="absolute top-1 left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] transform -translate-x-1/2" />
                      </div>
                      <div className="absolute inset-x-2 inset-y-2 border border-white/40 rounded-full" style={{ animation: 'spinSlow 3s linear reverse infinite' }}>
                        <div className="absolute bottom-[-1px] right-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)]" />
                      </div>
                      <Sparkles size={26} className="text-white relative z-10" />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse z-10" />
                    AI Engine
                  </span>
                </div>

                {/* Data stream 2 */}
                <div className="relative w-8 sm:w-12 h-6 flex items-center overflow-hidden shrink-0">
                  <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
                  {[0, 1, 2].map(i => (
                    <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]"
                      style={{ left: '-10px', animation: `dataFlow 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.4 + 0.6}s infinite` }} />
                  ))}
                </div>

                {/* Extracted Data card */}
                <div className="flex flex-col items-center gap-3 z-10" style={{ animation: 'floatItem 3.2s ease-in-out 1s infinite' }}>
                  <div className="w-20 h-24 bg-white dark:bg-[#1a1a1a] border border-green-300/50 dark:border-green-700/50 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.1)] p-2 flex flex-col justify-center gap-2.5 relative overflow-hidden">
                    {/* Unit 1 */}
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-[3px] bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)] shrink-0" />
                        <div className="h-1.5 bg-green-500/60 dark:bg-green-500/40 rounded-full w-full origin-left" style={{ animation: 'scaleReveal 3s ease-out infinite' }} />
                      </div>
                      <div className="flex items-center gap-1.5 pl-3">
                        <div className="w-1 h-1 rounded-full bg-green-400/80 shrink-0" />
                        <div className="h-1 bg-green-400/50 dark:bg-green-400/30 rounded-full w-4/5 origin-left" style={{ animation: 'scaleReveal 3s ease-out 0.2s infinite' }} />
                      </div>
                      <div className="flex items-center gap-1.5 pl-3">
                        <div className="w-1 h-1 rounded-full bg-green-400/80 shrink-0" />
                        <div className="h-1 bg-green-400/50 dark:bg-green-400/30 rounded-full w-2/3 origin-left" style={{ animation: 'scaleReveal 3s ease-out 0.4s infinite' }} />
                      </div>
                    </div>

                    {/* Unit 2 */}
                    <div className="space-y-1.5 w-full mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-[3px] bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)] shrink-0" />
                        <div className="h-1.5 bg-green-500/60 dark:bg-green-500/40 rounded-full w-5/6 origin-left" style={{ animation: 'scaleReveal 3s ease-out 1.5s infinite' }} />
                      </div>
                      <div className="flex items-center gap-1.5 pl-3">
                        <div className="w-1 h-1 rounded-full bg-green-400/80 shrink-0" />
                        <div className="h-1 bg-green-400/50 dark:bg-green-400/30 rounded-full w-3/4 origin-left" style={{ animation: 'scaleReveal 3s ease-out 1.7s infinite' }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full z-10">Units & Topics</span>
                </div>
              </div>

              <style>{`
                @keyframes scanMove { 
                  0% { top: -5%; opacity: 0; } 
                  20%, 80% { opacity: 1; } 
                  100% { top: 105%; opacity: 0; } 
                }
                @keyframes dataFlow { 
                  0% { transform: translateX(0); opacity: 0; } 
                  20% { opacity: 1; } 
                  80% { opacity: 1; } 
                  100% { transform: translateX(40px); opacity: 0; } 
                }
                @keyframes spinSlow { 100% { transform: rotate(360deg); } }
                @keyframes pulseGlow { 
                  0%, 100% { box-shadow: 0 0 15px rgba(34,197,94,0.4); } 
                  50% { box-shadow: 0 0 35px rgba(34,197,94,0.8); } 
                }
                @keyframes scaleReveal {
                  0% { transform: scaleX(0); opacity: 0; }
                  15%, 80% { transform: scaleX(1); opacity: 1; }
                  100% { transform: scaleX(1); opacity: 0; }
                }
                @keyframes floatItem { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                @keyframes floatItemDelay { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(8px); } }
              `}</style>

              <div className="text-center space-y-1 mt-2">
                <p className="text-base font-bold bg-gradient-to-r from-green-600 to-green-400 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                  Extracting Syllabus...
                </p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Our AI is analyzing document to automatically extract units and topics.
                </p>
                <div className="inline-flex items-center justify-center gap-1.5 mt-3 text-[11px] font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                  <Shield size={12} className="animate-pulse" />
                  Please don't close this window
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
