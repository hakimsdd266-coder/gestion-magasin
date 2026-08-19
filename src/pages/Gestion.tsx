import { useState } from 'react'
import { Package, Boxes } from 'lucide-react'
import Products from './Products'
import Stock from './Stock'
import { useLanguage } from '../lib/i18n.jsx'

function Gestion({ storeId }) {
  const { t } = useLanguage()
  const [subTab, setSubTab] = useState('products')

  return (
    <div>
      <div className="px-4 pt-6 max-w-md mx-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('products')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              subTab === 'products'
                ? 'bg-gradient-to-br from-primary-from to-primary-to text-white shadow-glow-violet'
                : 'bg-white/5 text-violet-300/70 border border-white/10'
            }`}
          >
            <Package size={16} />
            {t('navProducts')}
          </button>
          <button
            onClick={() => setSubTab('stock')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              subTab === 'stock'
                ? 'bg-gradient-to-br from-primary-from to-primary-to text-white shadow-glow-violet'
                : 'bg-white/5 text-violet-300/70 border border-white/10'
            }`}
          >
            <Boxes size={16} />
            {t('navStock')}
          </button>
        </div>
      </div>

      {subTab === 'products' && <Products storeId={storeId} />}
      {subTab === 'stock' && <Stock storeId={storeId} />}
    </div>
  )
}

export default Gestion
