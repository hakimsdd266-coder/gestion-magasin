import { Home, Package, ShoppingCart, Boxes, User, BarChart3 } from 'lucide-react'
import { useLanguage } from '../lib/i18n.jsx'

function BottomNav({ active, onChange }) {
  const { t } = useLanguage()

  const tabs = [
    { key: 'home', label: t('navHome'), icon: Home },
    { key: 'products', label: t('navProducts'), icon: Package },
    { key: 'sale', label: t('navSale'), icon: ShoppingCart },
    { key: 'stock', label: t('navStock'), icon: Boxes },
    { key: 'reports', label: t('navReports'), icon: BarChart3 },
    { key: 'profile', label: t('navProfile'), icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/5 backdrop-blur-xl border-t border-white/10 flex justify-around py-2 z-40">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex flex-col items-center gap-1 px-2 py-1"
          >
            <Icon
              size={20}
              className={isActive ? 'text-primary-from' : 'text-violet-300/60'}
            />
            <span
              className={`text-[10px] ${
                isActive
                  ? 'font-semibold text-transparent bg-clip-text bg-gradient-to-br from-primary-from to-primary-to'
                  : 'text-violet-300/60'
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
