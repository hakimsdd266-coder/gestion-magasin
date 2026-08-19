import { useState } from 'react'
import { BarChart3, Users } from 'lucide-react'
import Reports from './Reports'
import Customers from './Customers'
import { useLanguage } from '../lib/i18n.jsx'

function Finances({ storeId }) {
  const { t } = useLanguage()
  const [subTab, setSubTab] = useState('reports')

  return (
    <div>
      <div className="px-4 pt-6 max-w-md mx-auto">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('reports')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              subTab === 'reports'
                ? 'bg-gradient-to-br from-primary-from to-primary-to text-white shadow-glow-violet'
                : 'bg-white/5 text-violet-300/70 border border-white/10'
            }`}
          >
            <BarChart3 size={16} />
            {t('navReports')}
          </button>
          <button
            onClick={() => setSubTab('customers')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${
              subTab === 'customers'
                ? 'bg-gradient-to-br from-primary-from to-primary-to text-white shadow-glow-violet'
                : 'bg-white/5 text-violet-300/70 border border-white/10'
            }`}
          >
            <Users size={16} />
            {t('navClients')}
          </button>
        </div>
      </div>

      {subTab === 'reports' && <Reports storeId={storeId} />}
      {subTab === 'customers' && <Customers storeId={storeId} />}
    </div>
  )
}

export default Finances
