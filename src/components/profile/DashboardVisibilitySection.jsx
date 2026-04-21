import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useProfileMutations } from '../../hooks/useProfile'
import { Card, SectionTitle, StatusBanner, Toggle } from './ProfileUI'
import { getErrorMessage } from './helpers'

export default function DashboardVisibilitySection({ user }) {
  const mutations = useProfileMutations()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isTeacherHidden = user?.hideTeacherSection ?? false
  const isStudentHidden = user?.hideStudentSection ?? false

  return (
    <Card>
      <SectionTitle sub="Customize your dashboard by hiding sections you don't use">
        <span className="flex items-center gap-2">
          <Eye size={15} className="text-green-500" />
          Dashboard Visibility
        </span>
      </SectionTitle>

      <div className="space-y-3">
        <StatusBanner type="error" message={error} onClose={() => setError('')} />

        <Toggle
          checked={isTeacherHidden}
          disabled={isStudentHidden || loading}
          onChange={async () => {
            setError('')
            setLoading(true)
            try {
              await mutations.toggleTeacherSectionVis.mutateAsync()
            } catch (err) {
              setError(getErrorMessage(err, 'Failed to update visibility.'))
            } finally {
              setLoading(false)
            }
          }}
          label="Hide Teacher Dashboard"
          description="Removes 'My Subjects' and teaching controls from your dashboard."
        />
        <div className="h-px bg-gray-100 dark:bg-[#2a2a2a] my-4" />
        <Toggle
          checked={isStudentHidden}
          disabled={isTeacherHidden || loading}
          onChange={async () => {
            setError('')
            setLoading(true)
            try {
              await mutations.toggleStudentSectionVis.mutateAsync()
            } catch (err) {
              setError(getErrorMessage(err, 'Failed to update visibility.'))
            } finally {
              setLoading(false)
            }
          }}
          label="Hide Student Dashboard"
          description="Removes 'Enrolled Subjects' and student view from your dashboard."
        />
      </div>
    </Card>
  )
}
