import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">{t('homeTitle')}</h1>

        <div className="bg-blue-600 rounded-2xl p-5 mb-6 text-white">
          <p className="text-blue-100 text-sm mb-1">{t('salesTodayLabel')}</p>
          <p className="text-3xl font-semibold">{totalDuJour.toFixed(2)} {t('currency')}</p>
          <p className="text-blue-100 text-sm mt-1">
            {ventesDuJour.length} {ventesDuJour.length !== 1 ? t('salesWord') : t('saleWord')}
          </p>
        </div>

        <h2 className="text-sm font-medium text-gray-500 mb-2">{t('salesHistory')}</h2>

        {loading && <p className="text-gray-500 text-center py-8">{t('loadingText')}</p>}

        {!loading && sales.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            {t('noSalesYet')}
          </div>
        )}

        <div className="space-y-2">
          {sales.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleExpand(s.id)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-800">{Number(s.total).toFixed(2)} {t('currency')}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(s.created_at).toLocaleString(localeCode, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {s.payment_method === 'cash' ? t('cash') : t('other')}
                  </p>
                </div>
                {expanded === s.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {expanded === s.id && (
                <div className="border-t border-gray-100 px-4 py-3">
                  {!items[s.id] && <p className="text-sm text-gray-400">{t('loadingText')}</p>}
                  {items[s.id]?.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-600">{it.products?.name || t('productDeleted')} × {it.quantity}</span>
                      <span className="text-gray-800">{Number(it.subtotal).toFixed(2)} {t('currency')}</span>
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
