import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import Home from './Home'
import Sale from './Sale'
import Gestion from './Gestion'
import Finances from './Finances'
import Profile from './Profile'
import { useLanguage } from '../lib/i18n.jsx'

function Dashboard({ storeId }) {
  const [tab, setTab] = useState('home')
  const { lang, setLang } = useLanguage()

  return (
    <div>
      <button
        onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
        className="fixed top-4 right-4 z-30 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-200 text-xs backdrop-blur-xl hover:bg-white/10 transition-colors"
      >
        {lang === 'fr' ? 'العربية' : 'FR'}
      </button>

      <div className="pt-12">
        {tab === 'home' && <Home storeId={storeId} onNavigate={setTab} />}
        {tab === 'sale' && <Sale storeId={storeId} />}
        {tab === 'gestion' && <Gestion storeId={storeId} />}
        {tab === 'finances' && <Finances storeId={storeId} />}
        {tab === 'profile' && <Profile storeId={storeId} />}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default Dashboard
