import React, { useState } from 'react'
import { getTopicMaterialUrl } from '../api/topics'
import { usePlayer } from '../context/PlayerContext'

export default function TopicMaterialPill({ subjectId, unitId, topicId, material, onSelect, isSelected }) {
  const { openPlayer } = usePlayer()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleClick = async (e) => {
    e.stopPropagation()
    
    if (onSelect) {
      onSelect(material.id)
      return
    }

    if (loading) return
    setLoading(true)
    setErr('')
    try {
      const res = await getTopicMaterialUrl(subjectId, unitId, topicId, material.id)
      if (res.topicMaterialUrl) {
        const type = material.type?.toLowerCase();
        if (type === 'video' || type === 'audio') {
          openPlayer({ 
            url: res.topicMaterialUrl, 
            type: material.type, 
            title: material.title 
          });
        } else {
          window.open(res.topicMaterialUrl, '_blank', 'noreferrer')
        }
      }
    } catch (error) {
      console.error('Failed to get material URL:', error)
      setErr('Failed to open material')
    } finally {
      setLoading(false)
    }
  }

  let iconUrl = "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/default_file.svg";
  const t = material.type?.toLowerCase();
  if (t === 'video') iconUrl = "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/file_type_video.svg";
  else if (t === 'audio') iconUrl = "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/file_type_audio.svg";
  else if (t === 'image') iconUrl = "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/file_type_image.svg";
  else if (t === 'pdf') iconUrl = "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/file_type_pdf2.svg";
  else if (t === 'word') iconUrl = "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/file_type_word.svg";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all w-full outline-none text-left
        ${err ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
             : isSelected ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 ring-2 ring-red-500/20'
             : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'}
      `}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border transition-colors ${
        isSelected ? 'bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800' 
                   : 'bg-gray-50 dark:bg-[#222] border-gray-100 dark:border-[#333]'
      }`}>
        {loading ? (
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <img src={iconUrl} alt={t} className={`w-5 h-5 object-contain ${isSelected ? 'opacity-70 grayscale' : ''}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate transition-colors ${
          isSelected ? 'text-red-800 dark:text-red-300' 
                     : 'text-gray-900 dark:text-gray-100'
        }`}>
          {material.title}
        </p>
        {err && <p className="text-[10px] text-red-500 mt-0.5">{err}</p>}
        {isSelected && (
          <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 font-medium">Selected for deletion</p>
        )}
      </div>
    </button>
  )
}


