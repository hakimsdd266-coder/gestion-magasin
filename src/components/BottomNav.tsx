import { Home, ShoppingCart, Package, Wallet, User } from 'lucide-react'
import { useLanguage } from '../lib/i18n.jsx'

function BottomNav({ active, onChange }) {
  const { t } = useLanguage()

  const tabs = [
    { key: 'home', label: t('navHome'), icon: Home },
    { key: 'sale', label: t('navSale'), icon: ShoppingCart },
    { key: 'gestion', label: t('navGestion'), icon: Package },
    { key: 'finances', label: t('navFinances'), icon: Wallet },
    { key: 'profile', label: t('navProfile'), icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/[0.04] backdrop-blur-xl border-t border-white/10 shadow-elevated-lg flex justify-around py-2 z-40">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex flex-col items-center gap-1 px-3 py-1 active:scale-95 transition-transform"
          >
            <div
              className={
                isActive
                  ? 'icon-badge icon-badge-sm icon-badge-violet'
                  : 'w-9 h-9 rounded-xl flex items-center justify-center text-violet-300/50'
              }
            >
              <Icon size={18} />
            </div>
            <span
              className={`text-[10px] ${
                isActive
                  ? 'font-semibold text-transparent bg-clip-text bg-gradient-to-br from-primary-from to-primary-to'
                  : 'text-violet-300/50'
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
