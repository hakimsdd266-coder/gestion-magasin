import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function Auth() {
  const { lang, setLang, t } = useLanguage()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const traduireErreur = (msg) => {
    if (msg.includes('already registered')) return t('errorEmailUsed')
    if (msg.includes('Invalid login credentials')) return t('errorInvalidCredentials')
    if (msg.includes('Password should be at least')) return t('errorPasswordShort')
    return msg
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(traduireErreur(error.message))
      else setMessage(t('accountCreated'))
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(traduireErreur(error.message))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          className="mb-6 mx-auto block px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm"
        >
          {lang === 'fr' ? 'العربية' : 'Français'}
        </button>

        <h1 className="text-2xl font-semibold text-center mb-8 text-gray-800">
          {mode === 'login' ? t('login') : t('signup')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? t('loadingText') : mode === 'login' ? t('loginButton') : t('signupButton')}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
          className="w-full mt-6 text-blue-600 text-sm text-center"
        >
          {mode === 'login' ? t('noAccount') : t('hasAccount')}
        </button>
      </div>
    </div>
  )
}

export default Auth
