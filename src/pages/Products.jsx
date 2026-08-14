import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, X, ScanLine } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BarcodeScanner from '../components/BarcodeScanner'

function Products({ storeId }) {
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
      setError('Erreur lors de la création de la catégorie.')
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
      setError("Erreur lors de l'enregistrement.")
      setSaving(false)
      return
    }

    setSaving(false)
    setModalOpen(false)
    charger()
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) console.error(error)
    else setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Produits</h1>

        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-base"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-4 pb-1 -mx-4 px-4">
            <button
              onClick={() => setFilterCategory('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              Toutes
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm ${filterCategory === c.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-gray-500 text-center py-8">Chargement...</p>}

        {!loading && filtres.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
            Aucun produit
          </div>
        )}

        <div className="space-y-2">
          {filtres.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-sm text-gray-500">
                  {p.sale_price} DA · Stock: {p.quantity}
                  {p.quantity <= p.alert_threshold && (
                    <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs">
                      Stock bas
                    </span>
                  )}
                </p>
                {p.category_id && (
                  <p className="text-xs text-gray-400 mt-0.5">{nomCategorie(p.category_id)}</p>
                )}
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => ouvrirModif(p)} className="p-2 text-gray-500">
                  <Pencil size={18} />
                </button>
                <button onClick={() => supprimer(p.id)} className="p-2 text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={ouvrirAjout}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center z-40"
      >
        <Plus size={26} />
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editing ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nom du produit"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code-barres"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-base"
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="px-4 rounded-xl bg-blue-50 text-blue-600"
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
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-base bg-white"
                    >
                      <option value="">Aucune catégorie</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-4 rounded-xl bg-gray-100 text-gray-600 text-sm whitespace-nowrap"
                    >
                      + Nouvelle
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nom de la catégorie"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-base"
                    />
                    <button
                      type="button"
                      onClick={creerCategorie}
                      className="px-4 rounded-xl bg-blue-600 text-white text-sm"
                    >
                      Créer
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix d'achat"
                  value={form.purchase_price}
                  onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix de vente"
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Quantité"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
                />
                <input
                  type="number"
                  placeholder="Seuil alerte"
                  value={form.alert_threshold}
                  onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
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
