import { useState, useEffect } from 'react'
import { Search, ScanLine, Plus, Minus, Trash2, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarcodeScanner from '../components/BarcodeScanner'
import { useLanguage } from '../lib/i18n.jsx'

const fieldStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#f5f3ff' }

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
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="heading text-xl mb-4">{t('saleTitle')}</h1>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-300/50" />
            <input
              type="text"
              placeholder={t('searchProductShort')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              style={fieldStyle}
            />
          </div>
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 rounded-xl bg-gradient-to-br from-primary-from to-primary-to text-white flex items-center justify-center"
          >
            <ScanLine size={20} />
          </button>
        </div>

        {resultats.length > 0 && (
          <div className="glass-card mb-4 overflow-hidden">
            {resultats.map((p) => (
              <button
                key={p.id}
                onClick={() => ajouterAuPanier(p)}
                disabled={p.quantity <= 0}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-white/10 last:border-0 disabled:opacity-40"
              >
                <span className="text-violet-50">{p.name}</span>
                <span className="text-sm text-muted">{p.sale_price} {t('currency')} · {t('stockLabel')}: {p.quantity}</span>
              </button>
            ))}
          </div>
        )}

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <h2 className="text-sm font-medium text-muted mb-2">{t('cartLabel')}</h2>

        {cart.length === 0 && (
          <div className="glass-card p-8 text-center text-muted">
            {t('cartEmpty')}
          </div>
        )}

        <div className="space-y-2">
          {cart.map((i) => (
            <div key={i.id} className="glass-card p-3 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-violet-50 truncate">{i.name}</p>
                <p className="text-sm text-muted">{i.sale_price} {t('currency')} × {i.quantity} = {(i.sale_price * i.quantity).toFixed(2)} {t('currency')}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => changerQuantite(i.id, -1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-violet-200 hover:bg-white/20 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center text-violet-50">{i.quantity}</span>
                <button onClick={() => changerQuantite(i.id, 1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-violet-200 hover:bg-white/20 transition-colors">
                  <Plus size={16} />
                </button>
                <button onClick={() => retirer(i.id)} className="ml-1 text-danger hover:text-rose-300 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white/5 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="max-w-md mx-auto flex items-center justify-between mb-3">
            <span className="text-muted">{t('totalLabel')}</span>
            <span className="text-xl font-display font-semibold text-violet-50">{total.toFixed(2)} {t('currency')}</span>
          </div>
          <button
            onClick={() => setConfirming(true)}
            className="w-full max-w-md mx-auto block btn-primary text-center"
          >
            {t('checkout')}
          </button>
        </div>
      )}

      {scannerOpen && (
        <BarcodeScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      )}

      {confirming && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="surface rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading text-lg">{t('confirmSale')}</h2>
              <button onClick={() => setConfirming(false)} className="text-violet-300/60 hover:text-violet-100 transition-colors">
                <X size={22} />
              </button>
            </div>

            <p className="text-3xl font-display font-semibold text-violet-50 mb-4">{total.toFixed(2)} {t('currency')}</p>

            <p className="text-sm text-muted mb-2">{t('paymentMethod')}</p>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${paymentMethod === 'cash' ? 'bg-gradient-to-br from-primary-from to-primary-to text-white' : 'bg-white/5 text-violet-300/70 border border-white/10'}`}
              >
                {t('cash')}
              </button>
              <button
                onClick={() => setPaymentMethod('other')}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${paymentMethod === 'other' ? 'bg-gradient-to-br from-primary-from to-primary-to text-white' : 'bg-white/5 text-violet-300/70 border border-white/10'}`}
              >
                {t('other')}
              </button>
            </div>

            {error && <p className="text-danger text-sm mb-3">{error}</p>}

            <button
              onClick={validerVente}
              disabled={processing}
              className="btn-primary w-full disabled:opacity-50"
            >
              {processing ? t('processing') : t('validateSale')}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="surface px-6 py-4 shadow-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
              <Check size={18} className="text-success" />
            </div>
            <span className="font-medium text-violet-50">{t('saleRecorded')}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sale
