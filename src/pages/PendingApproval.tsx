import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function PendingApproval() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <button
        onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
        className="fixed top-4 right-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-200 text-xs backdrop-blur-xl hover:bg-white/10 transition-colors"
      >
        {lang === 'fr' ? 'العربية' : 'FR'}
      </button>

      <div className="w-16 h-16 rounded-full bg-warning/15 flex items-center justify-center mb-6">
        <span className="text-2xl">⏳</span>
      </div>
      <h1 className="heading text-xl mb-2">{t('pendingTitle')}</h1>
      <p className="text-muted mb-8">{t('pendingMessage')}</p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="btn-secondary"
      >
        {t('logout')}
      </button>
    </div>
  )
}

export default PendingApproval
