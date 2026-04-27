import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null)

  const onCloseRef = useRef(onClose)
  
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const modalElement = modalRef.current
    if (!modalElement) return undefined

    const previousActiveElement = document.activeElement
    const getFocusableElements = () =>
      Array.from(modalElement.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
      )

    const focusableElements = getFocusableElements()
    ;(focusableElements[0] || modalElement).focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const currentFocusableElements = getFocusableElements()
      if (currentFocusableElements.length === 0) {
        event.preventDefault()
        modalElement.focus()
        return
      }

      const firstElement = currentFocusableElements[0]
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    modalElement.addEventListener('keydown', handleKeyDown)

    return () => {
      modalElement.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement instanceof HTMLElement && document.body.contains(previousActiveElement)) {
        previousActiveElement.focus()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />
      {/* Modal Card */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all animate-zoom-in"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-50 hover:bg-gray-100 dark:bg-[#2a2a2a] dark:hover:bg-[#333] p-1.5 rounded-full">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
