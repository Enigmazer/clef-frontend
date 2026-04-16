import { useState } from 'react'
import { ChevronDown, ChevronUp, Mail } from 'lucide-react'
import PublicPageNav from '../components/PublicPageNav'
import PublicFooter from '../components/PublicFooter'

const faqs = [
  {
    q: 'How do I create a subject?',
    a: 'After signing in, go to your Dashboard and click "Create a subject". Enter a name and optional description. A unique 6-character join code is generated automatically — share it with your students.',
  },
  {
    q: 'How do students join a subject?',
    a: 'Students go to the Enrollments page and enter the 6-character join code provided by their teacher. They are enrolled instantly with no approval required.',
  },
  {
    q: 'How does the AI syllabus parser work?',
    a: 'Upload a PDF, Word document, or plain text file containing your syllabus. Clef AI reads the document and automatically extracts units, topics, and their ordering to generate your full course structure. You can edit everything after generation.',
  },
  {
    q: 'What is Class Sync?',
    a: 'Class Sync means every enrolled student always sees the current topic and the next topic in real time. When you advance the class to the next topic, all student views update immediately — no one is ever out of sync.',
  },
  {
    q: 'Can I be both a teacher and a student?',
    a: 'Yes. Every Clef account has dual roles. You can create your own subjects (as a teacher) and enroll in subjects created by others (as a student) — all from the same account.',
  },
  {
    q: 'How do I sign in? Is there a password?',
    a: 'Clef uses OAuth2 — sign in with your Google or GitHub account. No password is required. If you want to add email/password login later, you can set a password from your Profile page after signing in.',
  },
  {
    q: 'How do I assign homework?',
    a: 'From a subject Homework page, create a new homework assignment, link it to one or more topics, and set a due date. Enrolled students will see the homework in context with the relevant topics.',
  },
  {
    q: 'Can I attach materials to topics?',
    a: 'Yes. On any topic, you can attach PDFs, videos, and document links as Topic Materials. Students see these materials when viewing the topic.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Email us at support.clef@gmail.com with your account email and we will delete your account and all associated data within 30 days.',
  },
  {
    q: 'Is Clef free?',
    a: 'Yes, Clef is currently available at no cost. There are no subscription fees or credit card requirements.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />
        }
      </div>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#2a2a2a] pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

export default function SupportPage() {
  return (
    <div className="bg-white dark:bg-[#0f0f0f] min-h-screen">
      <PublicPageNav />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Support</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Find answers to common questions, or reach out to us directly.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-[#052e16]/40 border border-green-100 dark:border-green-900/50 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-[#052e16] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Still need help?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Can&apos;t find what you&apos;re looking for? Our team is happy to help.
          </p>
          <a
            href="mailto:support.clef@gmail.com"
            className="inline-flex items-center gap-2 bg-green-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Mail size={15} />
            support.clef@gmail.com
          </a>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
