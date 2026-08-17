import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function MailIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  )
}

function LockIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 11s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

function SpinnerIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" {...props}>
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
  )
}

function AlertIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function Auth() {
  const { lang, setLang, t } = useLanguage()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [featureIndex, setFeatureIndex] = useState(0)

  const loginFeatures = t('loginFeatures')

  useEffect(() => {
    if (mode !== 'login') return
    const id = setInterval(() => {
      setFeatureIndex((i) => (i + 1) % loginFeatures.length)
    }, 3000)
    return () => clearInterval(id)
  }, [mode, loginFeatures.length])

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
          {mode === 'login' ? (
            <p key={featureIndex} className="text-muted text-sm mb-6 animate-fade-slide">
              {loginFeatures[featureIndex]}
            </p>
          ) : (
            <p className="text-muted text-sm mb-6">{t('signupTagline')}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email */}
            <div>
              <label className="block text-xs font-medium text-violet-300/60 mb-1.5">
                {t('email')}
              </label>
              <div className="relative">
                <MailIcon
                  className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 pointer-events-none"
                  style={{ insetInlineStart: '0.875rem' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input-field"
                  style={{ paddingInlineStart: '2.5rem' }}
                />
              </div>
            </div>

            {/* mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-violet-300/60">
                  {t('password')}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="text-xs text-violet-300/60 hover:text-violet-200 transition-colors"
                  >
                    {t('forgotPassword')}
                  </button>
                )}
              </div>
              <div className="relative">
                <LockIcon
                  className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 pointer-events-none"
                  style={{ insetInlineStart: '0.875rem' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="input-field"
                  style={{ paddingInlineStart: '2.5rem', paddingInlineEnd: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 hover:text-violet-200 transition-colors"
                  style={{ insetInlineEnd: '0.875rem' }}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2.5">
                <AlertIcon className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                <CheckIcon className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading && <SpinnerIcon />}
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
