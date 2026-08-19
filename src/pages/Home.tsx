import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, Receipt, Banknote, CreditCard } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function Home({ storeId }) {
  const { t, lang } = useLanguage()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})

  const charger = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) console.error(error)
    else setSales(data)
    setLoading(false)
  }

  useEffect(() => { charger() }, [storeId])

  const aujourdHui = new Date().toDateString()
  const ventesDuJour = sales.filter((s) => new Date(s.created_at).toDateString() === aujourdHui)
  const totalDuJour = ventesDuJour.reduce((sum, s) => sum + Number(s.total), 0)

  const toggleExpand = async (saleId) => {
    if (expanded === saleId) {
      setExpanded(null)
      return
    }
    setExpanded(saleId)
    if (!items[saleId]) {
      const { data, error } = await supabase
        .from('sale_items')
        .select('*, products(name)')
        .eq('sale_id', saleId)
      if (!error) setItems((prev) => ({ ...prev, [saleId]: data }))
    }
  }

  const localeCode = lang === 'ar' ? 'ar-DZ' : 'fr-FR'

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="heading text-xl mb-4">{t('homeTitle')}</h1>

        <div className="relative bg-gradient-to-br from-primary-from to-primary-to rounded-2xl p-5 mb-6 text-white shadow-lg shadow-primary-from/25 overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">{t('salesTodayLabel')}</p>
              <p className="text-3xl font-display font-semibold">{totalDuJour.toFixed(2)} {t('currency')}</p>
              <p className="text-white/70 text-sm mt-1">
                {ventesDuJour.length} {ventesDuJour.length !== 1 ? t('salesWord') : t('saleWord')}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <h2 className="text-sm font-medium text-muted mb-2">{t('salesHistory')}</h2>

        {loading && <p className="text-muted text-center py-8">{t('loadingText')}</p>}

        {!loading && sales.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Receipt size={26} /></div>
            <p className="empty-state-title">{t('noSalesYet')}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {sales.map((s) => (
            <div key={s.id} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleExpand(s.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5"
              >
                <div className={`icon-badge icon-badge-sm ${s.payment_method === 'cash' ? 'icon-badge-emerald' : 'icon-badge-sky'}`}>
                  {s.payment_method === 'cash' ? <Banknote size={16} /> : <CreditCard size={16} />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-violet-50">{Number(s.total).toFixed(2)} {t('currency')}</p>
                  <p className="text-sm text-muted">
                    {new Date(s.created_at).toLocaleString(localeCode, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {s.payment_method === 'cash' ? t('cash') : t('other')}
                  </p>
                </div>
                {expanded === s.id ? <ChevronUp size={18} className="text-violet-300/50 shrink-0" /> : <ChevronDown size={18} className="text-violet-300/50 shrink-0" />}
              </button>

              {expanded === s.id && (
                <div className="border-t border-white/10 px-4 py-3">
                  {!items[s.id] && <p className="text-sm text-violet-300/50">{t('loadingText')}</p>}
                  {items[s.id]?.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-violet-300/80">{it.products?.name || t('productDeleted')} × {it.quantity}</span>
                      <span className="text-violet-50">{Number(it.subtotal).toFixed(2)} {t('currency')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
