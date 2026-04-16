import PublicPageNav from '../components/PublicPageNav'
import PublicFooter from '../components/PublicFooter'

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using clef, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service. We reserve the right to update these terms at any time, and continued use of the service constitutes acceptance of any changes.`,
  },
  {
    title: 'Use of the Service',
    content: `clef is an educational platform for creating and managing academic subjects, units, topics, and homework. You may use the service for lawful educational purposes only. You agree not to use clef to distribute harmful, illegal, or inappropriate content, or to interfere with the service's operation.`,
  },
  {
    title: 'User Accounts',
    content: `You are responsible for maintaining the security of your account. You must sign in using a valid Google or GitHub account. You are responsible for all activity that occurs under your account. Sign out of all devices from profile section and Notify us immediately at support.clef@gmail.com if you suspect unauthorized access.`,
  },
  {
    title: 'Content Ownership',
    content: `You retain ownership of all content you create on clef, including subject descriptions, topics, and uploaded materials. By uploading content, you grant clef a limited license to store and display that content to provide the service. We do not claim ownership of your content.`,
  },
  {
    title: 'Acceptable Use',
    content: `You agree not to: (a) upload content that infringes intellectual property rights; (b) harass or harm other users; (c) attempt to gain unauthorized access to any part of the service; (d) use the service for commercial purposes without our written consent; (e) scrape or automate access to the service.`,
  },
  {
    title: 'Service Availability',
    content: `We strive to maintain high availability but do not guarantee uninterrupted access to clef. We may perform maintenance, updates, or experience outages. We are not liable for any loss resulting from service unavailability.`,
  },
  {
    title: 'Termination',
    content: `We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting support.clef@gmail.com. Upon termination, your data will be deleted in accordance with our Privacy Policy.`,
  },
  {
    title: 'Limitation of Liability',
    content: `clef is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service.`,
  },
  {
    title: 'Contact',
    content: `For questions about these Terms of Service, contact us at support.clef@gmail.com.`,
  },
]

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-[#0f0f0f] min-h-screen">
      <PublicPageNav />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: January 1, 2025</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
          Please read these Terms of Service carefully before using clef. These terms govern your access to and use of the platform.
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
