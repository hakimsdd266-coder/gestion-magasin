import { useState, useEffect } from 'react'
import { Plus, X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Stock({ storeId }) {
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
      setError("Erreur lors de l'enregistrement.")
      setSaving(false)
      return
    }

    setSaving(false)
    setModalOpen(false)
    charger()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Mouvements de stock</h1>

        {loading && <p className="text-gray-500 text-center py-8">Chargement...</p>}

        {!loading && movements.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
            Aucun mouvement pour l'instant
          </div>
        )}

        <div className="space-y-2">
          {movements.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              {m.type === 'in' ? (
                <ArrowDownCircle size={22} className="text-green-500 shrink-0" />
              ) : (
                <ArrowUpCircle size={22} className="text-red-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {m.products?.name || 'Produit supprimé'}
                </p>
                <p className="text-sm text-gray-500">
                  {m.type === 'in' ? '+' : '-'}{m.quantity}
                  {m.reason ? ` · ${m.reason}` : ''}
                </p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">
                {new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </p>
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
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Mouvement de stock</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (stock: {p.quantity})</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'in' })}
                  className={`flex-1 py-2.5 rounded-xl font-medium ${form.type === 'in' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Entrée
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'out' })}
                  className={`flex-1 py-2.5 rounded-xl font-medium ${form.type === 'out' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Sortie
                </button>
              </div>

              <input
                type="number"
                placeholder="Quantité"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
              />

              <input
                type="text"
                placeholder="Raison (optionnel — casse, inventaire...)"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving || !form.product_id}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stock
