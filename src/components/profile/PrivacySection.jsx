import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useProfileMutations } from '../../hooks/useProfile'
import { Card, SectionTitle, StatusBanner, Toggle } from './ProfileUI'
import { getErrorMessage } from './helpers'

export default function PrivacySection({ user }) {
  const mutations = useProfileMutations()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <Card>
      <SectionTitle sub="Manage what information is visible to others">
        <span className="flex items-center gap-2">
          <Lock size={15} className="text-green-500" />
          Privacy Settings
        </span>
      </SectionTitle>

      <div className="space-y-3">
        <StatusBanner type="error" message={error} onClose={() => setError('')} />

        <Toggle
          checked={user?.showPhoneToStudents ?? false}
          disabled={loading}
          onChange={async () => {
            setError('')
            setLoading(true)
            try {
              await mutations.toggleVisibility.mutateAsync()
            } catch (err) {
              setError(getErrorMessage(err, 'Failed to update phone visibility.'))
            } finally {
              setLoading(false)
            }
          }}
          label="Show phone number to students"
          description="Students enrolled in your subjects will be able to see your phone number(s)."
        />
      </div>
    </Card>
  )
}
