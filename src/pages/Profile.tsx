import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

const fieldStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#f5f3ff' }

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
      <div className="min-h-screen flex items-center justify-center pb-20">
        <p className="text-muted">{t('loadingText')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="heading text-xl mb-6">{t('profileTitle')}</h1>

        <div className="glass-card p-5 mb-4">
          <h2 className="text-sm font-medium text-muted mb-3">{t('storeSection')}</h2>
          <form onSubmit={handleUpdateStore} className="space-y-3">
            <input
              type="text"
              placeholder={t('storeNameLabel')}
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              required
              className="input-field"
              style={fieldStyle}
            />
            <input
              type="text"
              placeholder={t('storeAddressLabel')}
              value={store.address}
              onChange={(e) => setStore({ ...store, address: e.target.value })}
              className="input-field"
              style={fieldStyle}
            />
            <input
              type="tel"
              placeholder={t('storePhoneLabel')}
              value={store.phone}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
              className="input-field"
              style={fieldStyle}
            />

            {storeError && <p className="text-danger text-sm">{storeError}</p>}
            {storeMsg && <p className="text-success text-sm">{storeMsg}</p>}

            <button
              type="submit"
              disabled={savingStore}
              className="btn-primary w-full disabled:opacity-50"
            >
              {savingStore ? t('saving') : t('updateInfo')}
            </button>
          </form>
        </div>

        <div className="glass-card p-5 mb-4">
          <h2 className="text-sm font-medium text-muted mb-3">{t('accountSection')}</h2>
          <p className="text-sm text-muted mb-4">
            {t('connectedAs')} <span className="font-medium text-violet-50">{email}</span>
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <p className="text-sm text-muted">{t('changePasswordLabel')}</p>
            <input
              type="password"
              placeholder={t('newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="input-field"
              style={fieldStyle}
            />

            {passwordError && <p className="text-danger text-sm">{passwordError}</p>}
            {passwordMsg && <p className="text-success text-sm">{passwordMsg}</p>}

            <button
              type="submit"
              disabled={savingPassword}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {savingPassword ? t('saving') : t('updatePasswordButton')}
            </button>
          </form>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full py-3 rounded-xl bg-danger/15 text-danger font-medium hover:bg-danger/25 transition-colors"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default Profile
