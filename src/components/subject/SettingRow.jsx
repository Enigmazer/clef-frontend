export default function SettingRow({ title, description, action }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] sm:max-w-none">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}
