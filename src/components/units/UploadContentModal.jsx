import { useState, useRef } from 'react'
import Modal from '../../components/Modal'

export default function UploadContentModal({ isOpen, onClose, unit, uploadMaterialMutation }) {
  const fileInputRef = useRef(null)
  const [selectedTopicId, setSelectedTopicId] = useState(null)

  const handleTopicClick = (topicId) => {
    setSelectedTopicId(topicId)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 50)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedTopicId) return

    const allowedTypes = [
      "audio/mpeg", "audio/mp4", "video/mp4", "video/x-matroska",
      "application/pdf", "image/jpeg", "image/png", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload a valid document, image, or media file.");
      e.target.value = null;
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be 50MB or less.");
      e.target.value = null;
      return;
    }

    try {
      onClose()
      await uploadMaterialMutation.mutateAsync({ unitId: unit.id, topicId: selectedTopicId, file })
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to upload material')
    }
    e.target.value = null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Content to ${unit.title}`}>
      <div className="pt-2 pb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 px-2">Select a topic to upload your material to:</p>

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="audio/mpeg,audio/mp4,video/mp4,video/x-matroska,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />

        <div className="space-y-2 px-1 max-h-[60vh] overflow-y-auto">
          {unit.topics.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No topics available in this unit.</p>
          ) : (
            unit.topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 dark:bg-[#1a1a1a] dark:hover:bg-[#222] border border-gray-100 dark:border-[#2a2a2a] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
              >
                {topic.title}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
