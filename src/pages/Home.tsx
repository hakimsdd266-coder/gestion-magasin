import { useState, useEffect } from 'react'
import {
  ChevronDown, ChevronUp, ChevronRight, TrendingUp, TrendingDown,
  Receipt, Banknote, CreditCard, ShoppingCart, Package, Users,
  AlertTriangle, Wallet,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function Home({ storeId, onNavigate = () => {} }) {
  const { t, lang } = useLanguage()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})
  const [showAll, setShowAll] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [debtCustomersCount, setDebtCustomersCount] = useState(0)

  const charger = async () => {
    setLoading(true)
    const [
      { data: salesData, error: salesErr },
      { data: prods, error: prodErr },
      { data: custs, error: custErr },
      { data: txs, error: txErr },
    ] = await Promise.all([
      supabase.from('sales').select('*').eq('store_id', storeId).order('created_at', { ascending: false }).limit(50),
      supabase.from('products').select('id, quantity, alert_threshold').eq('store_id', storeId),
      supabase.from('customers').select('id').eq('store_id', storeId),
      supabase.from('credit_transactions').select('customer_id, type, amount').eq('store_id', storeId),
    ])

    if (salesErr) console.error(salesErr)
    else setSales(salesData)

    if (prodErr) console.error(prodErr)
    else setLowStockCount((prods || []).filter((p) => p.quantity <= p.alert_threshold).length)

    if (custErr) console.error(custErr)
    if (txErr) console.error(txErr)
    if (!custErr && !txErr && custs && txs) {
      const soldes = {}
      txs.forEach((tx) => {
        soldes[tx.customer_id] = (soldes[tx.customer_id] || 0) + (tx.type === 'credit' ? Number(tx.amount) : -Number(tx.amount))
      })
      setDebtCustomersCount(custs.filter((c) => (soldes[c.id] || 0) > 0).length)
    }

    setLoading(false)
  }

  useEffect(() => { charger() }, [storeId])

  const aujourdHui = new Date().toDateString()
  const hierDate = new Date(Date.now() - 86400000).toDateString()
  const ventesDuJour = sales.filter((s) => new Date(s.created_at).toDateString() === aujourdHui)
  const ventesHier = sales.filter((s) => new Date(s.created_at).toDateString() === hierDate)
  const totalDuJour = ventesDuJour.reduce((sum, s) => sum + Number(s.total), 0)
  const totalHier = ventesHier.reduce((sum, s) => sum + Number(s.total), 0)
  const trendPct = totalHier > 0
    ? Math.round(((totalDuJour - totalHier) / totalHier) * 100)
    : (totalDuJour > 0 ? 100 : null)

  const salesAffichees = showAll ? sales : sales.slice(0, 5)

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

        <div className="relative bg-gradient-to-br from-primary-from to-primary-to rounded-2xl p-5 mb-5 text-white shadow-lg shadow-primary-from/25 overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">{t('salesTodayLabel')}</p>
              <p className="text-3xl font-display font-semibold">{totalDuJour.toFixed(2)} {t('currency')}</p>
              <p className="text-white/70 text-sm mt-1">
                {ventesDuJour.length} {ventesDuJour.length !== 1 ? t('salesWord') : t('saleWord')}
              </p>
              {trendPct !== null && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 mt-2">
                  {trendPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(trendPct)}% {t('vsYesterday')}
                </span>
              )}
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <button onClick={() => onNavigate('sale')} className="glass-card p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="icon-badge icon-badge-sm icon-badge-emerald">
              <ShoppingCart size={16} />
            </div>
            <span className="text-xs font-medium text-violet-100 text-center">{t('navSale')}</span>
          </button>
          <button onClick={() => onNavigate('gestion')} className="glass-card p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="icon-badge icon-badge-sm icon-badge-violet">
              <Package size={16} />
            </div>
            <span className="text-xs font-medium text-violet-100 text-center">{t('navProducts')}</span>
          </button>
          <button onClick={() => onNavigate('finances')} className="glass-card p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="icon-badge icon-badge-sm icon-badge-sky">
              <Users size={16} />
            </div>
            <span className="text-xs font-medium text-violet-100 text-center">{t('navClients')}</span>
          </button>
        </div>

        {(lowStockCount > 0 || debtCustomersCount > 0) && (
          <div className="mb-5">
            <h2 className="text-sm font-medium text-muted mb-2">{t('alertsTitle')}</h2>
            <div className="space-y-2.5">
              {lowStockCount > 0 && (
                <button onClick={() => onNavigate('gestion')} className="list-row w-full text-left">
                  <div className="icon-badge icon-badge-rose">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-violet-50">{lowStockCount} {t('lowStockSuffix')}</p>
                  </div>
                  <ChevronRight size={18} className="text-violet-300/40" />
                </button>
              )}
              {debtCustomersCount > 0 && (
                <button onClick={() => onNavigate('finances')} className="list-row w-full text-left">
                  <div className="icon-badge icon-badge-amber">
                    <Wallet size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-violet-50">{debtCustomersCount} {t('customersOwingSuffix')}</p>
                  </div>
                  <ChevronRight size={18} className="text-violet-300/40" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted">{t('salesHistory')}</h2>
          {sales.length > 5 && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className="text-xs font-medium text-violet-300 hover:text-violet-100 transition-colors"
            >
              {showAll ? t('showLess') : t('viewAll')}
            </button>
          )}
        </div>

        {loading && <p className="text-muted text-center py-8">{t('loadingText')}</p>}

        {!loading && sales.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Receipt size={26} /></div>
            <p className="empty-state-title">{t('noSalesYet')}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {salesAffichees.map((s) => (
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
