import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function CreateStore({ onCreated }) {
  const { lang, setLang, t } = useLanguage()
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
      setError(t('errorCreateStore'))
      setLoading(false)
      return
    }

    const { error: rpcError } = await supabase.rpc('set_own_store', {
      store_uuid: store.id,
    })

    if (rpcError) {
      setError(t('errorLinkStore'))
      setLoading(false)
      return
    }

    setLoading(false)
    onCreated()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <button
        onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
        className="fixed top-4 right-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-200 text-xs backdrop-blur-xl hover:bg-white/10 transition-colors"
      >
        {lang === 'fr' ? 'العربية' : 'FR'}
      </button>

      <div className="w-full max-w-sm">
        <h1 className="heading text-2xl text-center mb-2">
          {t('createStoreTitle')}
        </h1>
        <p className="text-sm text-muted text-center mb-8">
          {t('createStoreSubtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('storeName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="text"
            placeholder={t('storeAddress')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-field"
          />
          <input
            type="tel"
            placeholder={t('storePhone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t('creating') : t('createStoreButton')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateStore
