import { useState } from 'react'
import Modal from '../../components/Modal'

export default function HowManyModal({ isOpen, onClose, onConfirm, existingCount }) {
  const [count, setCount] = useState(1)
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add units">
      <div className="space-y-4 pt-1">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          How many units do you want to add? We'll pre-fill the titles for you — you can edit them before saving.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCount(c => Math.max(1, c - 1))}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors text-lg font-bold"
          >
            −
          </button>
          <span className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">{count}</span>
          <button
            onClick={() => setCount(c => Math.min(10, c + 1))}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors text-lg font-bold"
          >
            +
          </button>
          <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">
            unit{count !== 1 ? 's' : ''} starting from Unit {existingCount + 1}
          </span>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(count); onClose() }}
            className="flex-1 px-4 py-2.5 text-sm text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}
