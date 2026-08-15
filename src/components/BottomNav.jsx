import { Home, Package, ShoppingCart, Boxes, User } from 'lucide-react'
import { useLanguage } from '../lib/i18n.jsx'

function BottomNav({ active, onChange }) {
  const { t } = useLanguage()

  const tabs = [
    { key: 'home', label: t('navHome'), icon: Home },
    { key: 'products', label: t('navProducts'), icon: Package },
    { key: 'sale', label: t('navSale'), icon: ShoppingCart },
    { key: 'stock', label: t('navStock'), icon: Boxes },
    { key: 'profile', label: t('navProfile'), icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-40">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-1 px-3 py-1 ${
            active === key ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Icon size={22} />
          <span className="text-[11px]">{label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNav
