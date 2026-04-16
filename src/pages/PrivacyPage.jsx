import PublicPageNav from '../components/PublicPageNav'
import PublicFooter from '../components/PublicFooter'

const sections = [
  {
    title: 'Information We Collect',
    content: `When you sign in with Google or GitHub, we receive your name, email address, and profile picture from your OAuth2 provider. We do not receive or store your OAuth2 password. We also collect information you provide directly, such as subject names, descriptions, and syllabus content you upload to the platform.`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use your information to provide and improve the clef service, including creating and managing your account, enabling you to create subjects and enroll in others, and sending you relevant notifications about your classes. We do not sell your personal information to third parties.`,
  },
  {
    title: 'Data Storage',
    content: `Your data is stored securely on servers hosted by our infrastructure providers. We use industry-standard encryption for data in transit (HTTPS/TLS) and at rest.`,
  },
  {
    title: 'Cookies',
    content: `clef uses HttpOnly cookies to manage authentication sessions. These cookies are strictly necessary for the service to function and cannot be used to track you across other websites. We do not use advertising or analytics cookies.`,
  },
  {
    title: 'Third-Party Services',
    content: `We use Google and GitHub OAuth2 for authentication. When you sign in, you are subject to their respective privacy policies. We do not share your data with any other third parties except as required by law.`,
  },
  {
    title: 'Your Rights',
    content: `You may request deletion of your account and associated data at any time by contacting us at support.clef@gmail.com. You may also request a copy of the data we hold about you. We will respond to all requests within 30 days.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform. Continued use of clef after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: 'Contact',
    content: `If you have questions about this Privacy Policy, please contact us at support.clef@gmail.com.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="bg-white dark:bg-[#0f0f0f] min-h-screen">
      <PublicPageNav />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: January 1, 2025</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
          clef ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights regarding your data.
        </p>
        <div className="space-y-8">
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{content}</p>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
