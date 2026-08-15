import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function PendingApproval() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <button
        onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
        className="fixed top-4 right-4 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 text-xs"
      >
        {lang === 'fr' ? 'العربية' : 'FR'}
      </button>

      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
        <span className="text-2xl">⏳</span>
      </div>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">{t('pendingTitle')}</h1>
      <p className="text-gray-600 mb-8">{t('pendingMessage')}</p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium"
      >
        {t('logout')}
      </button>
    </div>
  )
}

export default PendingApproval
