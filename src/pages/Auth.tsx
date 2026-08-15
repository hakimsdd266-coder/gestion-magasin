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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          className="mb-6 mx-auto block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-violet-200 text-sm hover:bg-white/10 transition-colors"
        >
          {lang === 'fr' ? 'العربية' : 'Français'}
        </button>

        <h1 className="heading text-2xl text-center mb-8">
          {mode === 'login' ? t('login') : t('signup')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-field"
          />

          {error && <p className="text-danger text-sm">{error}</p>}
          {message && <p className="text-success text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t('loadingText') : mode === 'login' ? t('loginButton') : t('signupButton')}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
          className="w-full mt-6 text-primary-from text-sm text-center hover:opacity-80 transition-opacity"
        >
          {mode === 'login' ? t('noAccount') : t('hasAccount')}
        </button>
      </div>
    </div>
  )
}

export default Auth
