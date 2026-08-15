import { useState, useEffect } from 'react'
import { Search, ScanLine, Plus, Minus, Trash2, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarcodeScanner from '../components/BarcodeScanner'
import { useLanguage } from '../lib/i18n.jsx'

function Sale({ storeId }) {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [scannerOpen, setScannerOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const charger = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('name')
    if (error) console.error(error)
    else setProducts(data)
  }

  useEffect(() => { charger() }, [storeId])

  const resultats = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode || '').includes(search)
      )
    : []

  const ajouterAuPanier = (product) => {
    setCart((prev) => {
      const existant = prev.find((i) => i.id === product.id)
      if (existant) {
        if (existant.quantity >= product.quantity) return prev
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      if (product.quantity <= 0) return prev
      return [...prev, { id: product.id, name: product.name, sale_price: product.sale_price, stock: product.quantity, quantity: 1 }]
    })
    setSearch('')
  }

  const handleScan = (code) => {
    setScannerOpen(false)
    const produit = products.find((p) => p.barcode === code)
    if (produit) {
      ajouterAuPanier(produit)
    } else {
      setError(t('errorNoBarcodeProduct'))
      setTimeout(() => setError(''), 3000)
    }
  }

  const changerQuantite = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id !== id) return i
          const nouvelleQte = i.quantity + delta
          if (nouvelleQte > i.stock) return i
          return { ...i, quantity: nouvelleQte }
        })
        .filter((i) => i.quantity > 0)
    )
  }

  const retirer = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const total = cart.reduce((sum, i) => sum + i.quantity * i.sale_price, 0)

  const validerVente = async () => {
    setProcessing(true)
    setError('')

    const items = cart.map((i) => ({
      product_id: i.id,
      quantity: i.quantity,
      unit_price: i.sale_price,
    }))

    const { error } = await supabase.rpc('create_sale', {
      p_store_id: storeId,
      p_payment_method: paymentMethod,
      p_items: items,
    })

    if (error) {
      setError(t('errorSale'))
      setProcessing(false)
      return
    }

    setProcessing(false)
    setConfirming(false)
    setCart([])
    setSuccess(true)
    charger()
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">{t('saleTitle')}</h1>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchProductShort')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-base"
            />
          </div>
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 rounded-xl bg-blue-600 text-white"
          >
            <ScanLine size={20} />
          </button>
        </div>

        {resultats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
            {resultats.map((p) => (
              <button
                key={p.id}
                onClick={() => ajouterAuPanier(p)}
                disabled={p.quantity <= 0}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 disabled:opacity-40"
              >
                <span className="text-gray-800">{p.name}</span>
                <span className="text-sm text-gray-500">{p.sale_price} {t('currency')} · {t('stockLabel')}: {p.quantity}</span>
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <h2 className="text-sm font-medium text-gray-500 mb-2">{t('cartLabel')}</h2>

        {cart.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            {t('cartEmpty')}
          </div>
        )}

        <div className="space-y-2">
          {cart.map((i) => (
            <div key={i.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{i.name}</p>
                <p className="text-sm text-gray-500">{i.sale_price} {t('currency')} × {i.quantity} = {(i.sale_price * i.quantity).toFixed(2)} {t('currency')}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => changerQuantite(i.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center text-gray-800">{i.quantity}</span>
                <button onClick={() => changerQuantite(i.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <Plus size={16} />
                </button>
                <button onClick={() => retirer(i.id)} className="ml-1 text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto flex items-center justify-between mb-3">
            <span className="text-gray-600">{t('totalLabel')}</span>
            <span className="text-xl font-semibold text-gray-800">{total.toFixed(2)} {t('currency')}</span>
          </div>
          <button
            onClick={() => setConfirming(true)}
            className="w-full max-w-md mx-auto block py-3 rounded-xl bg-blue-600 text-white font-medium"
          >
            {t('checkout')}
          </button>
        </div>
      )}

      {scannerOpen && (
        <BarcodeScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}

      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{t('confirmSale')}</h2>
              <button onClick={() => setConfirming(false)} className="text-gray-400">
                <X size={22} />
              </button>
            </div>

            <p className="text-3xl font-semibold text-gray-800 mb-4">{total.toFixed(2)} {t('currency')}</p>

            <p className="text-sm text-gray-500 mb-2">{t('paymentMethod')}</p>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-2.5 rounded-xl font-medium ${paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {t('cash')}
              </button>
              <button
                onClick={() => setPaymentMethod('other')}
                className={`flex-1 py-2.5 rounded-xl font-medium ${paymentMethod === 'other' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {t('other')}
              </button>
            </div>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <button
              onClick={validerVente}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
            >
              {processing ? t('processing') : t('validateSale')}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={18} className="text-green-600" />
            </div>
            <span className="font-medium text-gray-800">{t('saleRecorded')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sale
