import { Home, Package, ShoppingCart, Boxes, User } from 'lucide-react'

const tabs = [
  { key: 'home', label: 'Accueil', icon: Home },
  { key: 'products', label: 'Produits', icon: Package },
  { key: 'sale', label: 'Vente', icon: ShoppingCart },
  { key: 'stock', label: 'Stock', icon: Boxes },
  { key: 'profile', label: 'Profil', icon: User },
]

function BottomNav({ active, onChange }) {
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
