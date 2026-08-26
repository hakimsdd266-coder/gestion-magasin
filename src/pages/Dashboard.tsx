import { useState } from 'react'
import { Search } from 'lucide-react'
import BottomNav from '../components/BottomNav'
import GlobalSearch from '../components/GlobalSearch'
import { ToastProvider } from '../lib/toast.jsx'
import Home from './Home'
import Sale from './Sale'
import Gestion from './Gestion'
import Finances from './Finances'
import Profile from './Profile'
import { useLanguage } from '../lib/i18n.jsx'

function Dashboard({ storeId }) {
  const [tab, setTab] = useState('home')
  const [gestionSubTab, setGestionSubTab] = useState('products')
  const [financesSubTab, setFinancesSubTab] = useState('reports')
  const [searchOpen, setSearchOpen] = useState(false)
  const { lang, setLang } = useLanguage()

  const navigateTo = (tabKey, subTabKey) => {
    if (subTabKey === 'products' || subTabKey === 'stock') setGestionSubTab(subTabKey)
    if (subTabKey === 'reports' || subTabKey === 'customers') setFinancesSubTab(subTabKey)
    setTab(tabKey)
  }

  return (
    <ToastProvider>
      <div>
        <button
          onClick={() => setSearchOpen(true)}
          className="fixed top-4 left-4 z-30 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-violet-200 backdrop-blur-xl hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Search size={15} />
        </button>

        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          className="fixed top-4 right-4 z-30 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-200 text-xs backdrop-blur-xl hover:bg-white/10 transition-colors"
        >
          {lang === 'fr' ? 'العربية' : 'FR'}
        </button>

        <div className="pt-12">
          {tab === 'home' && <Home storeId={storeId} onNavigate={navigateTo} />}
          {tab === 'sale' && <Sale storeId={storeId} />}
          {tab === 'gestion' && <Gestion storeId={storeId} initialSubTab={gestionSubTab} />}
          {tab === 'finances' && <Finances storeId={storeId} initialSubTab={financesSubTab} />}
          {tab === 'profile' && <Profile storeId={storeId} />}
        </div>

        <BottomNav active={tab} onChange={setTab} />

        {searchOpen && (
          <GlobalSearch
            storeId={storeId}
            onNavigate={navigateTo}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </div>
    </ToastProvider>
  )
}

export default Dashboard
