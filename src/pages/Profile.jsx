import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function Profile({ storeId }) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [store, setStore] = useState({ name: '', address: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [savingStore, setSavingStore] = useState(false)
  const [storeMsg, setStoreMsg] = useState('')
  const [storeError, setStoreError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const charger = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setEmail(user.email)

      const { data, error } = await supabase
        .from('stores')
        .select('name, address, phone')
        .eq('id', storeId)
        .single()

      if (!error && data) {
        setStore({ name: data.name || '', address: data.address || '', phone: data.phone || '' })
      }
      setLoading(false)
    }
    charger()
  }, [storeId])

  const handleUpdateStore = async (e) => {
    e.preventDefault()
    setSavingStore(true)
    setStoreMsg('')
    setStoreError('')

    const { error } = await supabase
      .from('stores')
      .update({ name: store.name, address: store.address, phone: store.phone })
      .eq('id', storeId)

    if (error) setStoreError(t('errorUpdateStore'))
    else setStoreMsg(t('storeUpdated'))
    setSavingStore(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordMsg('')
    setPasswordError('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(error.message.includes('at least') ? t('errorPasswordShort') : t('errorUpdatePassword'))
    } else {
      setPasswordMsg(t('passwordUpdated'))
      setNewPassword('')
    }
    setSavingPassword(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pb-20">
        <p className="text-gray-500">{t('loadingText')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">{t('profileTitle')}</h1>

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">{t('storeSection')}</h2>
          <form onSubmit={handleUpdateStore} className="space-y-3">
            <input
              type="text"
              placeholder={t('storeNameLabel')}
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
            />
            <input
              type="text"
              placeholder={t('storeAddressLabel')}
              value={store.address}
              onChange={(e) => setStore({ ...store, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
            />
            <input
              type="tel"
              placeholder={t('storePhoneLabel')}
              value={store.phone}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
            />

            {storeError && <p className="text-red-600 text-sm">{storeError}</p>}
            {storeMsg && <p className="text-green-600 text-sm">{storeMsg}</p>}

            <button
              type="submit"
              disabled={savingStore}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
            >
              {savingStore ? t('saving') : t('updateInfo')}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">{t('accountSection')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('connectedAs')} <span className="font-medium text-gray-800">{email}</span>
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <p className="text-sm text-gray-500">{t('changePasswordLabel')}</p>
            <input
              type="password"
              placeholder={t('newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
            />

            {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
            {passwordMsg && <p className="text-green-600 text-sm">{passwordMsg}</p>}

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
            >
              {savingPassword ? t('saving') : t('updatePasswordButton')}
            </button>
          </form>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default Profile
