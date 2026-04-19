import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useCreateSubject } from '../hooks/useSubjects'

export default function CreateSubjectPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateSubject()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Subject name is required.'
    if (name.trim().length > 255) e.name = 'Name cannot exceed 255 characters.'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    setErrors({})
    setServerError('')

    mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: (data) => navigate(`/subjects/${data.id}`),
        onError: (err) => {
          setServerError(err.response?.data?.message ?? 'Something went wrong. Please try again.')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer mb-4 inline-flex items-center gap-1 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create a subject</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            A join code will be generated automatically.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 flex flex-col gap-5">
          {serverError && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {serverError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Subject name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Advanced Java Programming"
              className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors ${
                errors.name ? 'border-red-400 dark:border-red-700' : 'border-gray-300 dark:border-[#2a2a2a]'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this subject cover?"
              rows={3}
              className="border border-gray-300 dark:border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <div
              onClick={() => navigate(-1)}
              className="flex-1 text-center border border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1e1e1e] transition-colors"
            >
              Cancel
            </div>
            <div
              onClick={handleSubmit}
              className={`flex-1 text-center bg-green-500 text-white text-sm font-medium rounded-lg px-4 py-2.5 cursor-pointer hover:bg-green-600 transition-colors ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {isPending ? 'Creating…' : 'Create subject'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
