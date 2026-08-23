import { useState, useEffect } from 'react'
import { Search, ScanLine, Plus, Minus, Trash2, X, ShoppingCart, Package, Banknote, CreditCard, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarcodeScanner from '../components/BarcodeScanner'
import { useToast } from '../lib/toast.jsx'
import { useLanguage } from '../lib/i18n.jsx'

const fieldStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#f5f3ff' }

function Sale({ storeId }) {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [scannerOpen, setScannerOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [processing, setProcessing] = useState(false)

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

  const favoris = products.filter((p) => p.is_favorite)
  const produitsGrille = favoris.length > 0 ? favoris : products

  const toggleFavori = async (e, product) => {
    e.stopPropagation()
    const nouveauStatut = !product.is_favorite
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_favorite: nouveauStatut } : p)))
    const { error } = await supabase.from('products').update({ is_favorite: nouveauStatut }).eq('id', product.id)
    if (error) {
      console.error(error)
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_favorite: !nouveauStatut } : p)))
    }
  }

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
      showToast(t('errorNoBarcodeProduct'), 'error')
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
      showToast(t('errorSale'), 'error')
      setProcessing(false)
      return
    }

    setProcessing(false)
    setConfirming(false)
    setCart([])
    showToast(t('saleRecorded'), 'success')
    charger()
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
            className="icon-badge icon-badge-violet shrink-0"
          >
            <ScanLine size={20} />
          </button>
        </div>

        {resultats.length > 0 && (
          <div className="glass-panel mb-4 divide-y divide-white/[0.06]">
            {resultats.map((p) => (
              <button
                key={p.id}
                onClick={() => ajouterAuPanier(p)}
                disabled={p.quantity <= 0}
                className="w-full flex items-center gap-3 px-4 py-3 disabled:opacity-40 text-left"
              >
                <div className="icon-badge icon-badge-sm icon-badge-violet shrink-0">
                  <Package size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-violet-50 truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.sale_price} {t('currency')} · {t('stockLabel')}: {p.quantity}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {!search.trim() && products.length > 0 && (
          <div className="mb-5">
            <div className="flex items-baseline gap-1.5 mb-2">
              <h2 className="text-sm font-medium text-muted">
                {favoris.length > 0 ? t('favoritesTitle') : t('productsTitle')}
              </h2>
              {favoris.length === 0 && (
                <span className="text-xs text-violet-300/40">{t('favoritesHint')}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {produitsGrille.map((p) => {
                const rupture = p.quantity <= 0
                const bas = !rupture && p.quantity <= p.alert_threshold
                return (
                  <div
                    key={p.id}
                    onClick={() => !rupture && ajouterAuPanier(p)}
                    className={`relative glass-card p-3 flex flex-col items-center gap-2 text-center transition-transform ${
                      rupture ? 'opacity-40' : 'active:scale-[0.97] cursor-pointer'
                    }`}
                  >
                    <button
                      onClick={(e) => toggleFavori(e, p)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-amber-300/70 hover:text-amber-300 transition-colors"
                    >
                      <Star size={13} fill={p.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    <div className={`icon-badge icon-badge-sm ${rupture ? 'icon-badge-neutral' : bas ? 'icon-badge-rose' : 'icon-badge-violet'}`}>
                      <Package size={16} />
                    </div>
                    <div className="w-full min-w-0">
                      <p className="text-sm font-medium text-violet-50 truncate">{p.name}</p>
                      <p className="text-xs text-muted mt-0.5">{p.sale_price} {t('currency')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <h2 className="text-sm font-medium text-muted mb-2">{t('cartLabel')}</h2>

        {cart.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><ShoppingCart size={26} /></div>
            <p className="empty-state-title">{t('cartEmpty')}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {cart.map((i) => (
            <div key={i.id} className="list-row">
              <div className="icon-badge icon-badge-sm icon-badge-emerald shrink-0">
                <ShoppingCart size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-violet-50 truncate">{i.name}</p>
                <p className="text-sm text-muted">{i.sale_price} {t('currency')} × {i.quantity} = <span className="text-violet-100 font-medium">{(i.sale_price * i.quantity).toFixed(2)} {t('currency')}</span></p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => changerQuantite(i.id, -1)} className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-violet-200 hover:bg-white/15 active:scale-95 transition-all">
                  <Minus size={15} />
                </button>
                <span className="w-6 text-center text-violet-50 font-medium">{i.quantity}</span>
                <button onClick={() => changerQuantite(i.id, 1)} className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-violet-200 hover:bg-white/15 active:scale-95 transition-all">
                  <Plus size={15} />
                </button>
                <button onClick={() => retirer(i.id)} className="action-icon-btn action-icon-btn-delete ml-1">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white/[0.04] backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-elevated-lg p-4 z-30">
          <div className="max-w-md mx-auto flex items-center justify-between mb-3">
            <span className="text-muted">{t('totalLabel')}</span>
            <span className="text-2xl font-display font-semibold text-violet-50">{total.toFixed(2)} {t('currency')}</span>
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
              <button onClick={() => setConfirming(false)} className="action-icon-btn bg-white/5 text-violet-300/60 hover:text-violet-100 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <p className="text-3xl font-display font-semibold text-violet-50 mb-4">{total.toFixed(2)} {t('currency')}</p>

            <p className="text-sm text-muted mb-2">{t('paymentMethod')}</p>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${paymentMethod === 'cash' ? 'bg-gradient-to-br from-primary-from to-primary-to text-white shadow-glow-violet' : 'bg-white/5 text-violet-300/70 border border-white/10'}`}
              >
                <Banknote size={17} />
                {t('cash')}
              </button>
              <button
                onClick={() => setPaymentMethod('other')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all ${paymentMethod === 'other' ? 'bg-gradient-to-br from-primary-from to-primary-to text-white shadow-glow-violet' : 'bg-white/5 text-violet-300/70 border border-white/10'}`}
              >
                <CreditCard size={17} />
                {t('other')}
              </button>
            </div>

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
    </div>
  )
}

export default Sale
