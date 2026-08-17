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
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* bandeau : logo + toggle langue */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-from to-primary-to flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l1-5h16l1 5" />
                <path d="M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
                <path d="M9 13a3 3 0 0 0 6 0" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-widest text-violet-300/70 uppercase">
              {lang === 'ar' ? 'إدارة المتجر' : 'Gestion Magasin'}
            </span>
          </div>
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-violet-200 text-xs hover:bg-white/10 transition-colors"
          >
            {lang === 'fr' ? 'العربية' : 'Français'}
          </button>
        </div>

        {/* carte */}
        <div className="glass-panel p-7">
          <h1 className="heading text-2xl mb-1.5">
            {mode === 'login' ? t('login') : t('signup')}
          </h1>
          <p className="text-muted text-sm mb-6">
            {mode === 'login' ? t('loginTagline') : t('signupTagline')}
          </p>

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

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? t('loadingText') : mode === 'login' ? t('loginButton') : t('signupButton')}
            </button>
          </form>
        </div>

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
