import { Home, Package, ShoppingCart, Boxes, User, BarChart3, Users } from 'lucide-react'
import { useLanguage } from '../lib/i18n.jsx'

function BottomNav({ active, onChange }) {
  const { t } = useLanguage()

  const tabs = [
    { key: 'home', label: t('navHome'), icon: Home },
    { key: 'products', label: t('navProducts'), icon: Package },
    { key: 'sale', label: t('navSale'), icon: ShoppingCart },
    { key: 'stock', label: t('navStock'), icon: Boxes },
    { key: 'reports', label: t('navReports'), icon: BarChart3 },
    { key: 'customers', label: t('navClients'), icon: Users },
    { key: 'profile', label: t('navProfile'), icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div
        className="flex justify-around items-center px-1 pt-2 bg-white/5 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.55)]"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-col items-center gap-1 px-2 py-1"
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-primary-from to-primary-to shadow-glow-violet'
                    : ''
                }`}
              >
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-white' : 'text-violet-300/50'}
                />
              </span>
              <span
                className={`text-[9.5px] leading-none transition-colors ${
                  isActive ? 'font-semibold text-violet-50' : 'text-violet-300/50'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
