import { useState, useEffect } from 'react'
import { Search, X, Package, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function GlobalSearch({ storeId, onNavigate, onClose }) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const charger = async () => {
      setLoading(true)
      const [{ data: prods, error: prodErr }, { data: custs, error: custErr }] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, barcode, sale_price, quantity, alert_threshold')
          .eq('store_id', storeId)
          .order('name'),
        supabase.from('customers').select('id, name, phone').eq('store_id', storeId).order('name'),
      ])
      if (prodErr) console.error(prodErr)
      else setProducts(prods || [])
      if (custErr) console.error(custErr)
      else setCustomers(custs || [])
      setLoading(false)
    }
    charger()
  }, [storeId])

  const q = query.trim().toLowerCase()
  const produitsFiltres = q
    ? products.filter((p) => p.name.toLowerCase().includes(q) || (p.barcode || '').includes(q)).slice(0, 8)
    : []
  const clientsFiltres = q
    ? customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8)
    : []
  const aucunResultat = q.length > 0 && !loading && produitsFiltres.length === 0 && clientsFiltres.length === 0

  const choisirProduit = () => {
    onNavigate('gestion', 'products')
    onClose()
  }

  const choisirClient = () => {
    onNavigate('finances', 'customers')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-ink">
      <div className="flex items-center gap-2.5 p-4 border-b border-white/10 shrink-0">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-300/50" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('globalSearchPlaceholder')}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={onClose}
          className="action-icon-btn bg-white/5 text-violet-300/60 hover:text-violet-100 hover:bg-white/10 shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="max-w-md mx-auto">
          {!q && (
            <p className="text-sm text-center text-violet-300/40 py-14">{t('globalSearchHint')}</p>
          )}

          {q && loading && <p className="text-muted text-center py-8">{t('loadingText')}</p>}

          {aucunResultat && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={26} /></div>
              <p className="empty-state-title">{t('globalSearchEmpty')}</p>
            </div>
          )}

          {produitsFiltres.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-wider text-violet-300/40 mb-2 px-1">
                {t('productsTitle')}
              </p>
              <div className="space-y-2.5">
                {produitsFiltres.map((p) => {
                  const bas = p.quantity <= p.alert_threshold
                  return (
                    <button key={p.id} onClick={choisirProduit} className="list-row w-full text-left">
                      <div className={`icon-badge ${bas ? 'icon-badge-rose' : 'icon-badge-violet'}`}>
                        {bas ? <AlertTriangle size={20} /> : <Package size={20} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-violet-50 truncate">{p.name}</p>
                        <p className="text-sm text-muted">{p.sale_price} {t('currency')} · {t('stockLabel')}: {p.quantity}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {clientsFiltres.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-wider text-violet-300/40 mb-2 px-1">
                {t('customersTitle')}
              </p>
              <div className="space-y-2.5">
                {clientsFiltres.map((c) => (
                  <button key={c.id} onClick={choisirClient} className="list-row w-full text-left">
                    <div className="icon-badge icon-badge-violet">
                      <span className="font-display font-semibold text-sm">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-violet-50 truncate">{c.name}</p>
                      {c.phone && <p className="text-sm text-muted">{c.phone}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GlobalSearch
