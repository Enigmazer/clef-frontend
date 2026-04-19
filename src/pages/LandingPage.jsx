import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, BookOpen, Users, ClipboardList, Hash,
  FileText, UserCheck, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { refresh } from '../api/auth'
import { getMe } from '../api/users'
import { useAuth } from '../context/AuthContext'
import PublicPageNav from '../components/PublicPageNav'
import PublicFooter from '../components/PublicFooter'

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-3xl" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="flex-1 mx-4 bg-gray-200 rounded h-5 text-xs text-gray-400 flex items-center px-2">
            clef.app/dashboard
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">Advanced Java Programming</div>
              <div className="text-xs text-gray-500 mt-0.5">24 students enrolled</div>
            </div>
            <span className="text-xs bg-green-50 text-green-700 font-medium px-2 py-1 rounded-full">
              Code: A3F9KL
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Topic</div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-900">Spring Boot Dependency Injection</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Up Next</div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600">JPA & Hibernate Basics</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Homework Due</div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-amber-900">Build a REST API</span>
              <span className="text-xs text-amber-600 font-medium">2 days left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: BookOpen,
    title: 'Syllabus Management',
    desc: 'Organize subjects into units and topics with full ordering control. Your curriculum, structured exactly how you want it.',
  },
  {
    icon: Users,
    title: 'Class Sync',
    desc: 'Every student always sees the current topic and what is coming next. Advance the class and everyone moves together instantly.',
  },
  {
    icon: ClipboardList,
    title: 'Homework Assignment',
    desc: 'Assign homework linked to specific topics. Students see it in context — no confusion about what it relates to.',
  },
  {
    icon: Hash,
    title: 'Join Codes',
    desc: 'Students join any subject with a simple 6-character code. No admin approval, no email invites, no friction.',
  },
  {
    icon: FileText,
    title: 'Topic Materials',
    desc: 'Attach PDFs, videos, and reading links to any topic. Everything students need is right where they need it.',
  },
  {
    icon: UserCheck,
    title: 'Dual Role',
    desc: 'Every user is both a teacher and a student. Create your own subjects and enroll in others — no account switching.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { isLoading, isAuthenticated, refreshUser } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated) return

    refresh()
      .then(() => getMe())
      .then((user) => {
        if (user) {
          refreshUser(user)
          navigate('/dashboard', { replace: true })
        }
      })
      .catch(() => { })
  }, [isLoading, isAuthenticated, navigate, refreshUser])

  const handleGetStarted = () => navigate('/login')
  const handleSeeHow = (e) => {
    e.preventDefault()
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white">
      <PublicPageNav />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950/20 dark:via-[#0f0f0f] dark:to-emerald-950/10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={12} />
              AI-powered syllabus parsing
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
              Your whole class,{' '}
              <span className="text-green-500">always in sync.</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-lg">
              Clef keeps teachers and students on the same page — literally. Upload your syllabus, let AI build your course, and keep every student in sync as you progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div
                onClick={handleGetStarted}
                className="flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
              >
                Get started
                <ArrowRight size={16} />
              </div>
              <div
                onClick={handleSeeHow}
                className="flex items-center justify-center gap-2 border border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                See how it works
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Sign in or Sing up with Google or GitHub</p>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* ── AI Feature Spotlight ── */}
      <section className="py-24 px-6 bg-green-50 dark:bg-[#0f0f0f] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-500/20 border border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={12} />
              Flagship Feature
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Upload a syllabus.{' '}
              <span className="text-green-500">AI does the rest.</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Stop spending hours manually creating units and topics. Upload your syllabus PDF or document and Clef&apos;s AI parser instantly extracts every unit, topic, and learning objective — generating your complete course structure in seconds.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Supports PDF, Word, and plain text syllabi',
                'Automatically detects units, topics, and ordering',
                'Fully editable after generation — you stay in control',
                'Works with any subject or curriculum format',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer hover:bg-green-600 transition-colors"
            >
              Try it now
              <ArrowRight size={16} />
            </div>
          </div>

          {/* AI mockup card */}
          <div className="relative">
            <div className="absolute inset-0 bg-green-400/20 dark:bg-green-500/10 blur-3xl rounded-3xl" />
            <div className="relative bg-white dark:bg-[#1a1a1a] border border-green-200 dark:border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl shadow-green-100 dark:shadow-none">
              <div className="bg-green-50 dark:bg-[#1e1e1e] border-b border-green-200 dark:border-[#2a2a2a] px-4 py-3 flex items-center gap-3">
                <Sparkles size={14} className="text-green-500" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Syllabus Parser</span>
                <span className="ml-auto text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Processing…</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="bg-green-50 dark:bg-[#1e1e1e] border border-dashed border-green-300 dark:border-[#2a2a2a] rounded-xl p-4 text-center">
                  <FileText size={24} className="text-green-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">CS301_Syllabus_Fall2025.pdf</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Uploaded</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
                  <span>Generated structure</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
                </div>
                {[
                  { unit: 'Unit 1', title: 'Java Fundamentals', topics: 4 },
                  { unit: 'Unit 2', title: 'Object-Oriented Design', topics: 6 },
                  { unit: 'Unit 3', title: 'Spring Boot & APIs', topics: 5 },
                ].map((u) => (
                  <div key={u.unit} className="bg-gray-50 dark:bg-[#1e1e1e] border border-gray-100 dark:border-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">{u.unit}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{u.title}</div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{u.topics} topics</span>
                  </div>
                ))}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-1">
                  + 3 more units detected
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 px-6 bg-white dark:bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Everything your class needs
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              From syllabus to homework, Clef handles the full lifecycle of a course — for teachers and students alike.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg hover:shadow-green-50 dark:hover:shadow-green-950/10 transition-all group"
              >
                <div className="w-10 h-10 bg-green-50 dark:bg-[#052e16] rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 dark:group-hover:bg-green-950/50 transition-colors">
                  <Icon size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50 dark:bg-[#111111]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Up and running in minutes
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No setup headaches. No manual data entry. Just upload and go.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-green-200 dark:bg-green-900" />
            {[
              {
                step: '01',
                icon: FileText,
                title: 'Upload your syllabus',
                desc: 'Drop in your PDF or document. Clef reads it and understands your course structure automatically.',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'AI builds your course',
                desc: 'Units, topics, and ordering are generated instantly. Edit anything you want — you are always in control.',
              },
              {
                step: '03',
                icon: Users,
                title: 'Students join and follow',
                desc: 'Share the 6-character join code. Students enroll instantly and stay in sync as you advance through topics.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-200 dark:shadow-green-900/40 relative z-10">
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold text-green-500 tracking-widest mb-2">STEP {step}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 bg-green-600 dark:bg-green-600 relative overflow-hidden">

        {/* Floating Educational Emojis */}
        <div className="absolute top-10 left-[10%] text-6xl opacity-10 transform -rotate-12 select-none pointer-events-none">📚</div>
        <div className="absolute bottom-10 left-[25%] text-5xl opacity-10 transform rotate-12 select-none pointer-events-none">🎓</div>
        <div className="absolute top-20 right-[25%] text-6xl opacity-10 transform rotate-6 select-none pointer-events-none">✏️</div>
        <div className="absolute bottom-12 right-[10%] text-5xl opacity-10 transform -rotate-12 select-none pointer-events-none">💡</div>
        <div className="absolute top-1/2 left-[5%] text-4xl opacity-10 transform -rotate-45 select-none pointer-events-none">🎵</div>
        <div className="absolute top-1/3 right-[5%] text-5xl opacity-10 transform rotate-45 select-none pointer-events-none">📖</div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6 text-3xl shadow-inner border border-white/5">
            🎓
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to sync your classroom?
          </h2>
          <p className="text-lg text-green-100/90 mb-10 max-w-xl mx-auto leading-relaxed font-medium">
            Take the friction out of syllabus planning, homework tracking, and class progression today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-xl"
            >
              Get started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
