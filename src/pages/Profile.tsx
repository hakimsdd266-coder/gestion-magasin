import { useState, useEffect } from 'react'
import { Store, ShieldCheck, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../lib/toast.jsx'
import { useLanguage } from '../lib/i18n.jsx'

const fieldStyle = { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#f5f3ff' }

function Profile({ storeId }) {
  const { t } = useLanguage()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [store, setStore] = useState({ name: '', address: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [savingStore, setSavingStore] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

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

    const { error } = await supabase
      .from('stores')
      .update({ name: store.name, address: store.address, phone: store.phone })
      .eq('id', storeId)

    if (error) showToast(t('errorUpdateStore'), 'error')
    else showToast(t('storeUpdated'), 'success')
    setSavingStore(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setSavingPassword(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      showToast(error.message.includes('at least') ? t('errorPasswordShort') : t('errorUpdatePassword'), 'error')
    } else {
      showToast(t('passwordUpdated'), 'success')
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
          <div className="flex items-center gap-2.5 mb-4">
            <div className="icon-badge icon-badge-sm icon-badge-violet">
              <Store size={16} />
            </div>
            <h2 className="text-sm font-semibold text-violet-100">{t('storeSection')}</h2>
          </div>
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
          <div className="flex items-center gap-2.5 mb-4">
            <div className="icon-badge icon-badge-sm icon-badge-sky">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-sm font-semibold text-violet-100">{t('accountSection')}</h2>
          </div>
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
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-danger/15 text-danger font-medium hover:bg-danger/25 transition-colors"
        >
          <LogOut size={17} />
          {t('logout')}
        </button>
      </div>
    </div>
  )
}

export default Profile
