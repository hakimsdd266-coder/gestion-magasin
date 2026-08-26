import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'
import logo from '../assets/logo.png'

function MailIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  )
}

function LockIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 11s3.5 7 10 7a9.74 9.74 0 0 1 5.39-1.61" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m2 2 20 20" />
    </svg>
  )
}

function SpinnerIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" {...props}>
      <path d="M12 2a10 10 0 1 0 10 10" />
    </svg>
  )
}

function AlertIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ArrowIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
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

  const translatedFeatures = t('loginFeatures')
  const loginFeatures = Array.isArray(translatedFeatures) ? translatedFeatures : []

  useEffect(() => {
    if (mode !== 'login' || !Array.isArray(loginFeatures) || loginFeatures.length === 0) return

    const id = setInterval(() => {
      setFeatureIndex((i) => (i + 1) % loginFeatures.length)
    }, 3000)

    return () => clearInterval(id)
  }, [mode, loginFeatures.length])

  const traduireErreur = (msg) => {
    if (!msg) return 'Une erreur est survenue.'
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

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })

        if (error) {
          setError(traduireErreur(error.message))
        } else {
          setMessage(t('accountCreated'))
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          setError(traduireErreur(error.message))
        }
      }
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = () => {
    setLang(lang === 'fr' ? 'ar' : 'fr')
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setMessage('')
  }

  const currentFeature =
    Array.isArray(loginFeatures) && loginFeatures.length > 0
      ? loginFeatures[featureIndex]
      : ''

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="hanouti-auth min-h-screen flex items-center justify-center px-5 py-8"
    >
      <style>{`
        .hanouti-auth {
          --hanouti-gold: #d7b342;
          --hanouti-green: #16c994;
          min-height: 100vh !important;
          width: 100%;
          position: relative;
          overflow: hidden;
          color: #f4f7f5;
          background:
            radial-gradient(circle at 8% 12%, rgba(0, 105, 74, .25), transparent 32%),
            radial-gradient(circle at 92% 18%, rgba(215, 179, 66, .08), transparent 28%),
            radial-gradient(circle at 82% 90%, rgba(0, 140, 96, .10), transparent 34%),
            linear-gradient(145deg, #07130f 0%, #050908 50%, #020403 100%) !important;
        }
        .hanouti-auth::before {
          content: '';
          position: absolute;
          width: 420px; height: 420px;
          left: -260px; top: 8%;
          border-radius: 50%;
          background: rgba(8, 177, 124, .08);
          filter: blur(75px);
          pointer-events: none;
        }
        .hanouti-auth::after {
          content: '';
          position: absolute;
          width: 360px; height: 360px;
          right: -220px; bottom: 4%;
          border-radius: 50%;
          background: rgba(215, 179, 66, .055);
          filter: blur(75px);
          pointer-events: none;
        }
        .hanouti-auth > div { position: relative; z-index: 1; }
        .hanouti-card {
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 28px !important;
          background: linear-gradient(145deg, rgba(18,29,25,.94), rgba(8,12,10,.97)) !important;
          box-shadow: 0 28px 80px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.035) !important;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .hanouti-title {
          color: #f5f7f6 !important;
          font-weight: 850 !important;
          letter-spacing: -.035em !important;
        }
        .hanouti-subtitle {
          color: rgba(232,236,234,.53) !important;
        }
        .hanouti-input {
          width: 100% !important;
          min-height: 60px !important;
          border: 1px solid rgba(255,255,255,.095) !important;
          border-radius: 20px !important;
          outline: none !important;
          color: #f3f6f4 !important;
          background: rgba(255,255,255,.045) !important;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }
        .hanouti-input:focus {
          border-color: rgba(22,201,148,.55) !important;
          background: rgba(255,255,255,.06) !important;
          box-shadow: 0 0 0 4px rgba(22,201,148,.075) !important;
        }
        .hanouti-auth button[type='submit'] {
          min-height: 60px;
          border-radius: 20px;
          background: linear-gradient(135deg, #18ce91 0%, #08a978 100%) !important;
          box-shadow: 0 14px 32px rgba(15,199,141,.18), inset 0 1px 0 rgba(255,255,255,.18);
        }
        @media (max-width: 520px) {
          .hanouti-auth { padding-left: 14px !important; padding-right: 14px !important; align-items: flex-start !important; }
          .hanouti-card { padding: 25px 20px !important; border-radius: 24px !important; }
          .hanouti-input { min-height: 57px !important; border-radius: 18px !important; }
          .hanouti-auth button[type='submit'] { min-height: 58px; border-radius: 18px; }
        }
      `}</style>
      <div className="w-full max-w-[460px]">
        {/* Nouveau branding : logo.png + HANOUTI + GESTION DE MAGASIN */}
        <div className="mb-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(212,175,55,0.28)',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
                }}
              >
                <img
                  src={logo}
                  alt="Hanouti"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div
                  className="font-black uppercase leading-none tracking-[0.12em] text-3xl sm:text-4xl truncate"
                  style={{
                    color: '#D4AF37',
                    textShadow: '0 2px 18px rgba(212,175,55,0.12)',
                  }}
                >
                  HANOUTI
                </div>
                <div
                  className="mt-2 text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                  style={{ color: '#2fcf8f' }}
                >
                  — GESTION DE MAGASIN —
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={lang === 'fr' ? 'Passer en arabe' : 'Passer en français'}
              className="shrink-0 px-4 py-2.5 rounded-full transition-all"
              style={{
                color: '#e5e7eb',
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {lang === 'fr' ? 'العربية' : 'Français'}
            </button>
          </div>
        </div>

        <div
          className="hanouti-card p-7 sm:p-8"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'linear-gradient(145deg, rgba(18,29,25,0.92), rgba(12,14,13,0.96))',
            boxShadow: '0 24px 70px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.025)',
          }}
        >
          <h1 className="hanouti-title text-3xl sm:text-4xl mb-2">
            {mode === 'login' ? t('login') : t('signup')}
          </h1>

          {mode === 'login' ? (
            <p
              key={`${lang}-${featureIndex}`}
              className="hanouti-subtitle text-sm sm:text-base mb-7"
            >
              {currentFeature}
            </p>
          ) : (
            <p className="hanouti-subtitle text-sm sm:text-base mb-7">
              {t('signupTagline')}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-violet-300/60 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <MailIcon
                  className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 pointer-events-none"
                  style={{ insetInlineStart: '1rem' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="hanouti-input"
                  style={{ paddingInlineStart: '2.8rem', minHeight: '58px' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 gap-3">
                <label className="text-sm font-medium text-violet-300/60">
                  {t('password')}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="text-sm text-violet-300/60 hover:text-violet-200 transition-colors"
                  >
                    {t('forgotPassword')}
                  </button>
                )}
              </div>

              <div className="relative">
                <LockIcon
                  className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 pointer-events-none"
                  style={{ insetInlineStart: '1rem' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="hanouti-input"
                  style={{
                    paddingInlineStart: '2.8rem',
                    paddingInlineEnd: '2.8rem',
                    minHeight: '58px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 hover:text-violet-200 transition-colors"
                  style={{ insetInlineEnd: '1rem' }}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-3">
                <AlertIcon className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-3">
                <CheckIcon className="shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full disabled:opacity-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 rounded-2xl font-semibold text-white"
              style={{
                minHeight: '58px',
                background: 'linear-gradient(135deg, #14c98b 0%, #09a878 100%)',
                boxShadow: '0 10px 28px rgba(20,201,139,0.16), inset 0 1px 0 rgba(255,255,255,0.16)',
              }}
            >
              {loading && <SpinnerIcon />}
              <span>
                {loading
                  ? t('loadingText')
                  : mode === 'login'
                    ? t('loginButton')
                    : t('signupButton')}
              </span>
              {!loading && mode === 'login' && <ArrowIcon aria-hidden="true" />}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={switchMode}
          className="w-full mt-6 text-sm text-center transition-opacity hover:opacity-80"
          style={{ color: '#16c994' }}
        >
          {mode === 'login' ? t('noAccount') : t('hasAccount')}
        </button>
      </div>
    </div>
  )
}

export default Auth
