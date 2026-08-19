import { useState, useEffect } from 'react'
import { Plus, X, ArrowDownCircle, ArrowUpCircle, Boxes } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

const fieldStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#f5f3ff' }

function Stock({ storeId }) {
  const { t, lang } = useLanguage()
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ product_id: '', type: 'in', quantity: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const charger = async () => {
    setLoading(true)
    const [{ data: mvts, error: mvtErr }, { data: prods, error: prodErr }] = await Promise.all([
      supabase
        .from('stock_movements')
        .select('*, products(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('products').select('id, name, quantity').eq('store_id', storeId).order('name'),
    ])
    if (mvtErr) console.error(mvtErr)
    else setMovements(mvts)
    if (prodErr) console.error(prodErr)
    else setProducts(prods)
    setLoading(false)
  }

  useEffect(() => { charger() }, [storeId])

  const ouvrirAjout = () => {
    setForm({ product_id: products[0]?.id || '', type: 'in', quantity: '', reason: '' })
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase.rpc('create_stock_movement', {
      p_store_id: storeId,
      p_product_id: form.product_id,
      p_type: form.type,
      p_quantity: parseInt(form.quantity),
      p_reason: form.reason || null,
    })

    if (error) {
      setError(t('errorSaving'))
      setSaving(false)
      return
    }

    setSaving(false)
    setModalOpen(false)
    charger()
  }

  const localeCode = lang === 'ar' ? 'ar-DZ' : 'fr-FR'

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="heading text-xl mb-4">{t('stockMovementsTitle')}</h1>

        {loading && <p className="text-muted text-center py-8">{t('loadingText')}</p>}

        {!loading && movements.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Boxes size={26} /></div>
            <p className="empty-state-title">{t('noMovementsYet')}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {movements.map((m) => (
            <div key={m.id} className="list-row">
              <div className={`icon-badge ${m.type === 'in' ? 'icon-badge-emerald' : 'icon-badge-rose'}`}>
                {m.type === 'in' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-violet-50 truncate">
                  {m.products?.name || t('productDeleted')}
                </p>
                <p className="text-sm text-muted">
                  <span className={m.type === 'in' ? 'text-success font-medium' : 'text-danger font-medium'}>
                    {m.type === 'in' ? '+' : '-'}{m.quantity}
                  </span>
                  {m.reason ? ` · ${m.reason}` : ''}
                </p>
              </div>
              <p className="text-xs text-violet-300/50 shrink-0">
                {new Date(m.created_at).toLocaleDateString(localeCode, { day: '2-digit', month: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={ouvrirAjout}
        className="fixed bottom-24 right-4 fab z-40"
      >
        <Plus size={26} />
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="surface rounded-t-3xl w-full p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-badge icon-badge-sm icon-badge-violet">
                <Boxes size={18} />
              </div>
              <h2 className="heading text-lg flex-1">{t('stockMovementModalTitle')}</h2>
              <button onClick={() => setModalOpen(false)} className="action-icon-btn bg-white/5 text-violet-300/60 hover:text-violet-100 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
                className="input-field"
                style={fieldStyle}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({t('stockLabel')}: {p.quantity})</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'in' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium border transition-colors ${form.type === 'in' ? 'bg-success/20 text-success border-success/40' : 'bg-white/5 text-violet-300/70 border-white/10'}`}
                >
                  <ArrowDownCircle size={17} />
                  {t('movementIn')}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'out' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium border transition-colors ${form.type === 'out' ? 'bg-danger/20 text-danger border-danger/40' : 'bg-white/5 text-violet-300/70 border-white/10'}`}
                >
                  <ArrowUpCircle size={17} />
                  {t('movementOut')}
                </button>
              </div>

              <input
                type="number"
                placeholder={t('quantity')}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                min="1"
                className="input-field"
                style={fieldStyle}
              />

              <input
                type="text"
                placeholder={t('reasonPlaceholder')}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="input-field"
                style={fieldStyle}
              />

              {error && <p className="text-danger text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving || !form.product_id}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? t('saving') : t('save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stock
