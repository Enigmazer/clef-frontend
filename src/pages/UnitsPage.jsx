import { useState, useEffect, startTransition } from 'react'
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom'
import { ChevronLeft, Plus, AlertCircle, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useTeacherSubjectDetail, useBulkAddUnits } from '../hooks/useSubjects'
import { buildDefaultUnits } from '../components/units/DefaultUnitsBuilder'
import ExistingUnitRow from '../components/units/ExistingUnitRow'
import DraftUnitEditor from '../components/units/DraftUnitEditor'
import HowManyModal from '../components/units/HowManyModal'
import ParseSyllabusModal from '../components/units/ParseSyllabusModal'

export default function UnitsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: subject, isLoading, isError } = useTeacherSubjectDetail(Number(id))
  const { mutateAsync: saveBulk, isPending: isSaving } = useBulkAddUnits(Number(id))

  const [drafts, setDrafts] = useState([])
  const [showHowMany, setShowHowMany] = useState(false)
  const [showParseModal, setShowParseModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (location.state?.openParseModal) {
      startTransition(() => setShowParseModal(true))
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const blocker = useBlocker(isSaving)
  useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }, [blocker])

  const existingCount = subject?.units?.length ?? 0

  const openAddModal = () => {
    setError('')
    setSuccess('')
    setShowHowMany(true)
  }

  const handleHowManyConfirm = (count) => {
    const existingCount = subject?.units?.length ?? 0
    const newUnits = buildDefaultUnits(count, existingCount + drafts.length)
    setDrafts(prev => [...prev, ...newUnits])
  }

  const updateDraft = (i, updated) => setDrafts(prev => prev.map((d, idx) => idx === i ? updated : d))
  const removeDraft = (i) => setDrafts(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    // Strip fully-untouched placeholder drafts
    const isUntouched = (u) => {
      const titleIsDefault = u.title.trim() === `Unit ${u._unitNum} -` || u.title.trim() === `Unit ${u._unitNum} - ` || u.title.trim() === ''
      const topicsAreDefault = u.topics.every((t) => t.title.trim() === '')
      return titleIsDefault && topicsAreDefault
    }
    const active = drafts.filter(u => !isUntouched(u))
    if (active.length === 0) { setError('Please fill in at least one unit before saving.'); return }

    // Validate
    const existingTitlesLower = new Set((subject?.units ?? []).map(u => u.title.trim().toLowerCase()))
    for (const u of active) {
      const t = u.title.trim()
      if (!t) { setError('All units must have a title.'); return }
      if (existingTitlesLower.has(t.toLowerCase())) {
        setError(`A unit named "${t}" already exists in this subject.`); return
      }
    }
    // Check duplicates within the new batch itself
    const newTitles = active.map(u => u.title.trim().toLowerCase())
    const hasDupUnit = newTitles.some((t, i) => newTitles.indexOf(t) !== i)
    if (hasDupUnit) { setError('Two of the new units share the same name — rename one.'); return }

    // Topic validation
    for (const u of active) {
      const topicTitles = u.topics.map(t => t.title.trim())
      for (const tt of topicTitles) {
        if (!tt) { setError(`Unit "${u.title.trim()}" has an empty topic — Atleast one topic is required.`); return }
      }
      const topicLower = topicTitles.map(t => t.toLowerCase())
      const hasDupTopic = topicLower.some((t, i) => topicLower.indexOf(t) !== i)
      if (hasDupTopic) { setError(`Unit "${u.title.trim()}" has two topics with the same name — rename one.`); return }
    }

    setError('')
    try {
      await saveBulk(active.map(u => ({
        title: u.title.trim(),
        topics: u.topics.map(t => ({ title: t.title.trim() })),
      })))
      setDrafts([])
      setSuccess(`${active.length} unit${active.length !== 1 ? 's' : ''} added successfully.`)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to save units. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Back */}
        <button
          onClick={() => !isSaving && navigate(`/subjects/${id}`)}
          disabled={isSaving}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 inline-flex items-center gap-1 mb-6 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          {subject?.name ?? 'Subject'}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manage Units</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Add units and topics to organise your curriculum.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setShowParseModal(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 px-3 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles size={14} className="shrink-0" />
              {existingCount > 0 ? 'Import from PDF' : 'Get from PDF'}
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              <Plus size={15} className="shrink-0" />
              Add units
            </button>
          </div>
        </div>


        {/* Loading */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-14 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl" />
            ))}
          </div>
        )}

        {/* Error loading */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle size={15} />
            Failed to load subject. Go back and try again.
          </div>
        )}

        {/* Existing units */}
        {subject && (
          <div className="space-y-3 mb-6">
            {subject.units?.length === 0 && drafts.length === 0 && (
              <div className="border border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl px-4 sm:px-6 py-8 sm:py-10 text-center bg-white dark:bg-[#1a1a1a]">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={22} className="text-green-500 dark:text-green-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No units yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
                  Parse your syllabus PDF to auto-populate units, or add them manually.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setShowParseModal(true)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    <Sparkles size={14} />
                    Get syllabus from PDF
                  </button>
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowRight size={14} />
                    Or add manually
                  </button>
                </div>
              </div>
            )}
            {subject.units?.map(unit => (
              <ExistingUnitRow key={unit.id} unit={unit} subjectId={subject.id} />
            ))}
          </div>
        )}

        {/* Draft units */}
        {drafts.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-500">
              New — not saved yet
            </p>
            {drafts.map((draft, i) => (
              <DraftUnitEditor
                key={i}
                unit={draft}
                onChange={(updated) => updateDraft(i, updated)}
                onRemove={() => removeDraft(i)}
              />
            ))}

            {/* Banners — shown near the action buttons so they're visible when editing */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 animate-slide-up">
                <AlertCircle size={15} className="shrink-0" />
                {error}
                <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100"><X size={13} /></button>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 bg-green-50 dark:bg-[#052e16]/60 border border-green-200 dark:border-green-900/50 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400 animate-slide-up">
                <CheckCircle2 size={15} className="shrink-0" />
                {success}
                <button onClick={() => setSuccess('')} className="ml-auto opacity-50 hover:opacity-100"><X size={13} /></button>
              </div>
            )}

            {/* Save / discard */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setDrafts([]); setError('') }}
                className="flex-1 border border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving…' : `Save ${drafts.length} unit${drafts.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* How many units modal */}
        <HowManyModal
          isOpen={showHowMany}
          onClose={() => setShowHowMany(false)}
          onConfirm={handleHowManyConfirm}
          existingCount={existingCount + drafts.length}
        />

        {/* Parse syllabus modal */}
        {subject && (
          <ParseSyllabusModal
            isOpen={showParseModal}
            onClose={() => setShowParseModal(false)}
            subject={subject}
            onParsed={(parsedDrafts) => {
              const base = (subject?.units?.length ?? 0) + drafts.length
              const numbered = parsedDrafts.map((d, i) => ({
                ...d,
                _unitNum: base + i + 1,
              }))
              setDrafts(prev => [...prev, ...numbered])
              setSuccess(`${parsedDrafts.length} unit${parsedDrafts.length !== 1 ? 's' : ''} imported from PDF — review and save below.`)
              setShowParseModal(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
