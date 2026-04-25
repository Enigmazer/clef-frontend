import { useState } from 'react'
import { Users, UserMinus } from 'lucide-react'
import { useEnrolledStudents, useRemoveEnrollment } from '../../hooks/useSubjects'
import ConfirmModal from '../ConfirmModal'
import { formatDate } from './helpers'

export default function EnrolledStudentsTab({ subjectId }) {
  const { data: students = [], isLoading } = useEnrolledStudents(subjectId)
  const removeMutation = useRemoveEnrollment(subjectId)

  const [studentToRemove, setStudentToRemove] = useState(null)

  const handleConfirmRemove = async () => {
    if (!studentToRemove) return
    try {
      await removeMutation.mutateAsync(studentToRemove.id)
      setStudentToRemove(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="py-2 animate-fade-in">
      <div className="flex sm:items-center justify-between mb-4 flex-col sm:flex-row gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white hidden md:block">Enrolled Students</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-auto">
          {isLoading ? 'Loading...' : `${students.length} student${students.length === 1 ? '' : 's'} enrolled`}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl" />
          <div className="h-16 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl" />
          <div className="h-16 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] border border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-xl px-6 py-10 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No students enrolled</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Share the join code with your students so they can join this subject.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
          <ul className="divide-y divide-gray-100 dark:divide-[#222]">
            {students.map((student) => (
              <li key={student.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <div className="shrink-0 relative">
                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[#333]"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
                    />
                  ) : null}
                  <div
                    className="w-10 h-10 rounded-full bg-green-100 dark:bg-[#052e16] text-green-700 dark:text-green-400 flex items-center justify-center text-sm font-bold border border-green-200 dark:border-green-900"
                    style={{ display: student.avatarUrl ? 'none' : 'flex' }}
                  >
                    {student.fullName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {student.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {student.email || 'No email provided'}
                  </p>
                </div>
                
                <div className="shrink-0 text-right pr-4 hidden sm:block">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Joined</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(student.joinedAt)}</p>
                </div>
                
                <div className="shrink-0">
                  <button
                    onClick={() => setStudentToRemove(student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-[#111] dark:hover:bg-red-950/30 border border-gray-200 hover:border-red-200 dark:border-[#333] dark:hover:border-red-900/50 rounded-lg transition-colors"
                  >
                    <UserMinus size={14} />
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmModal
        isOpen={!!studentToRemove}
        onClose={() => setStudentToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Student"
        message={`Are you sure you want to remove ${studentToRemove?.fullName} from this subject? They will lose access to all curriculum and homework.`}
        confirmText="Remove"
        loading={removeMutation.isPending}
      />
    </div>
  )
}
