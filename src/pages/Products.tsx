import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, X, ScanLine } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarcodeScanner from '../components/BarcodeScanner'
import { useLanguage } from '../lib/i18n.jsx'

const fieldStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#f5f3ff' }

function Products({ storeId }) {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [form, setForm] = useState({ name: '', barcode: '', category_id: '', purchase_price: '', sale_price: '', quantity: '', alert_threshold: '5' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const charger = async () => {
    setLoading(true)
    const [{ data: prods, error: prodErr }, { data: cats, error: catErr }] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', storeId).order('name'),
      supabase.from('categories').select('*').eq('store_id', storeId).order('name'),
    ])
    if (prodErr) console.error(prodErr)
    else setProducts(prods)
    if (catErr) console.error(catErr)
    else setCategories(cats)
    setLoading(false)
  }

  useEffect(() => { charger() }, [storeId])

  const nomCategorie = (id) => categories.find((c) => c.id === id)?.name

  const filtres = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode || '').includes(search)
    const matchCat = filterCategory === 'all' || p.category_id === filterCategory
    return matchSearch && matchCat
  })

  const ouvrirAjout = () => {
    setEditing(null)
    setForm({ name: '', barcode: '', category_id: '', purchase_price: '', sale_price: '', quantity: '', alert_threshold: '5' })
    setShowNewCategory(false)
    setError('')
    setModalOpen(true)
  }

  const ouvrirModif = (p) => {
    setEditing(p)
    setForm({
      name: p.name,
      barcode: p.barcode || '',
      category_id: p.category_id || '',
      purchase_price: p.purchase_price,
      sale_price: p.sale_price,
      quantity: p.quantity,
      alert_threshold: p.alert_threshold,
    })
    setShowNewCategory(false)
    setError('')
    setModalOpen(true)
  }

  const creerCategorie = async () => {
    if (!newCategory.trim()) return
    const { data, error } = await supabase
      .from('categories')
      .insert({ store_id: storeId, name: newCategory.trim() })
      .select()
      .single()

    if (error) {
      setError(t('errorCreateCategory'))
      return
    }
    setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setForm((f) => ({ ...f, category_id: data.id }))
    setNewCategory('')
    setShowNewCategory(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      store_id: storeId,
      name: form.name,
      barcode: form.barcode || null,
      category_id: form.category_id || null,
      purchase_price: parseFloat(form.purchase_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      quantity: parseInt(form.quantity) || 0,
      alert_threshold: parseInt(form.alert_threshold) || 5,
    }

    const { error } = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload)

    if (error) {
      setError(t('errorSaving'))
      setSaving(false)
      return
    }

    setSaving(false)
    setModalOpen(false)
    charger()
  }

  const supprimer = async (id) => {
    if (!confirm(t('confirmDeleteProduct'))) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) console.error(error)
    else setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="heading text-xl mb-4">{t('productsTitle')}</h1>

        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-300/50" />
          <input
            type="text"
            placeholder={t('searchProduct')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            style={fieldStyle}
          />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-4 pb-1 -mx-4 px-4">
            <button
              onClick={() => setFilterCategory('all')}
              className={`chip ${filterCategory === 'all' ? 'chip-active' : ''}`}
            >
              {t('allCategories')}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`chip ${filterCategory === c.id ? 'chip-active' : ''}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-muted text-center py-8">{t('loadingText')}</p>}

        {!loading && filtres.length === 0 && (
          <div className="glass-card p-8 text-center text-muted">
            {t('noProducts')}
          </div>
        )}

        <div className="space-y-2">
          {filtres.map((p) => (
            <div key={p.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-violet-50 truncate">{p.name}</p>
                <p className="text-sm text-muted">
                  {p.sale_price} {t('currency')} · {t('stockLabel')}: {p.quantity}
                  {p.quantity <= p.alert_threshold && (
                    <span className="ml-2 badge-danger">
                      {t('lowStock')}
                    </span>
                  )}
                </p>
                {p.category_id && (
                  <p className="text-xs text-violet-300/50 mt-0.5">{nomCategorie(p.category_id)}</p>
                )}
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => ouvrirModif(p)} className="p-2 text-violet-300/60 hover:text-violet-100 transition-colors">
                  <Pencil size={18} />
                </button>
                <button onClick={() => supprimer(p.id)} className="p-2 text-danger hover:text-rose-300 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
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
          <div className="surface rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="heading text-lg">
                {editing ? t('editProduct') : t('addProduct')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-violet-300/60 hover:text-violet-100 transition-colors">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder={t('productName')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input-field"
                style={fieldStyle}
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('barcode')}
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="input-field flex-1"
                  style={fieldStyle}
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-4 rounded-xl bg-primary-from/15 text-primary-from hover:bg-primary-from/25 transition-colors"
                >
                  <ScanLine size={22} />
                </button>
              </div>

              <div>
                {!showNewCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className="input-field flex-1"
                      style={fieldStyle}
                    >
                      <option value="">{t('noCategory')}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-4 rounded-xl bg-white/5 border border-white/10 text-violet-200 text-sm whitespace-nowrap hover:bg-white/10 transition-colors"
                    >
                      {t('newCategoryButton')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('categoryName')}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="input-field flex-1"
                      style={fieldStyle}
                    />
                    <button
                      type="button"
                      onClick={creerCategorie}
                      className="px-4 rounded-xl bg-gradient-to-br from-primary-from to-primary-to text-white text-sm font-medium"
                    >
                      {t('create')}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder={t('purchasePrice')}
                  value={form.purchase_price}
                  onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  className="input-field"
                  style={fieldStyle}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder={t('salePrice')}
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                  required
                  className="input-field"
                  style={fieldStyle}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder={t('quantity')}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  className="input-field"
                  style={fieldStyle}
                />
                <input
                  type="number"
                  placeholder={t('alertThreshold')}
                  value={form.alert_threshold}
                  onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })}
                  className="input-field"
                  style={fieldStyle}
                />
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? t('saving') : t('save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {scannerOpen && (
        <BarcodeScanner
          onScan={(code) => { setForm((f) => ({ ...f, barcode: code })); setScannerOpen(false) }}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  )
}

export default Products
