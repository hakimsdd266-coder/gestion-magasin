import { useState } from 'react'
import { supabase } from '../lib/supabase'

function CreateStore({ onCreated }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({ owner_id: user.id, name, address, phone })
      .select()
      .single()

    if (storeError) {
      setError("Erreur lors de la création du magasin.")
      setLoading(false)
      return
    }

    const { error: rpcError } = await supabase.rpc('set_own_store', {
      store_uuid: store.id,
    })

    if (rpcError) {
      setError("Magasin créé mais erreur de liaison au compte.")
      setLoading(false)
      return
    }

    setLoading(false)
    onCreated()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-2 text-gray-800">
          Créer mon magasin
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Dernière étape avant d'accéder à votre espace
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom du magasin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
          />
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon magasin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateStore
