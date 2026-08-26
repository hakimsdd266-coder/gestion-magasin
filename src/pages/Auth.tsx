import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'
import logo from '../assets/logo.png'
import '../hanouti-auth.css'

const Icon = ({ children, ...props }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>
)
const MailIcon = p => <Icon {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></Icon>
const LockIcon = p => <Icon {...p}><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></Icon>
const EyeIcon = p => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></Icon>
const EyeOffIcon = p => <Icon {...p}><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 11s3.5 7 10 7a9.74 9.74 0 0 1 5.39-1.61"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/></Icon>
const AlertIcon = p => <Icon {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>
const CheckIcon = p => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Icon>
const ArrowIcon = p => <Icon {...p} strokeWidth="2.5"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Icon>
const SpinnerIcon = p => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin" {...p}><path d="M12 2a10 10 0 1 0 10 10"/></svg>

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
    if (mode !== 'login' || loginFeatures.length === 0) return
    const id = setInterval(() => setFeatureIndex(i => (i + 1) % loginFeatures.length), 3000)
    return () => clearInterval(id)
  }, [mode, loginFeatures.length])

  const traduireErreur = msg => {
    if (!msg) return 'Une erreur est survenue.'
    if (msg.includes('already registered')) return t('errorEmailUsed')
    if (msg.includes('Invalid login credentials')) return t('errorInvalidCredentials')
    if (msg.includes('Password should be at least')) return t('errorPasswordShort')
    return msg
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(traduireErreur(error.message))
        else setMessage(t('accountCreated'))
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(traduireErreur(error.message))
      }
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  const switchMode = () => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }
  const currentFeature = loginFeatures.length ? loginFeatures[featureIndex] : ''

  return (
    <main dir={lang === 'ar' ? 'rtl' : 'ltr'} className="hanouti-auth min-h-screen flex items-center justify-center px-5 py-8">
      <div className="hanouti-auth-content w-full max-w-[460px]">
        <header className="mb-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="hanouti-logo-wrap"><img src={logo} alt="Hanouti" className="w-full h-full object-contain" /></div>
              <div className="min-w-0">
                <div className="hanouti-brand">HANOUTI</div>
                <div className="hanouti-brand-subtitle">— GESTION DE MAGASIN —</div>
              </div>
            </div>
            <button type="button" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} aria-label={lang === 'fr' ? 'Passer en arabe' : 'Passer en français'} className="hanouti-language">
              {lang === 'fr' ? 'العربية' : 'Français'}
            </button>
          </div>
        </header>

        <section className="hanouti-card p-7 sm:p-8">
          <h1 className="hanouti-title text-3xl sm:text-4xl mb-2">{mode === 'login' ? t('login') : t('signup')}</h1>
          {mode === 'login' ? <p key={`${lang}-${featureIndex}`} className="hanouti-subtitle text-sm sm:text-base mb-7">{currentFeature}</p> : <p className="hanouti-subtitle text-sm sm:text-base mb-7">{t('signupTagline')}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-violet-300/60 mb-2">{t('email')}</label>
              <div className="relative">
                <MailIcon className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 pointer-events-none" style={{ insetInlineStart: '1rem' }}/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="hanouti-input" style={{ paddingInlineStart: '2.8rem' }}/>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 gap-3">
                <label className="text-sm font-medium text-violet-300/60">{t('password')}</label>
                {mode === 'login' && <button type="button" className="text-sm text-violet-300/60 hover:text-violet-200 transition-colors">{t('forgotPassword')}</button>}
              </div>
              <div className="relative">
                <LockIcon className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 pointer-events-none" style={{ insetInlineStart: '1rem' }}/>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="hanouti-input" style={{ paddingInlineStart: '2.8rem', paddingInlineEnd: '2.8rem' }}/>
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute top-1/2 -translate-y-1/2 text-violet-300/40 hover:text-violet-200 transition-colors" style={{ insetInlineEnd: '1rem' }} aria-label={showPassword ? t('hidePassword') : t('showPassword')}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && <div className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-3"><AlertIcon className="shrink-0"/><span>{error}</span></div>}
            {message && <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-3"><CheckIcon className="shrink-0"/><span>{message}</span></div>}

            <button type="submit" disabled={loading} className="hanouti-submit w-full disabled:opacity-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 rounded-2xl font-semibold text-white">
              {loading && <SpinnerIcon/>}
              <span>{loading ? t('loadingText') : mode === 'login' ? t('loginButton') : t('signupButton')}</span>
              {!loading && mode === 'login' && <ArrowIcon aria-hidden="true"/>}
            </button>
          </form>
        </section>

        <button type="button" onClick={switchMode} className="hanouti-switch w-full mt-6 text-sm text-center transition-opacity hover:opacity-80">
          {mode === 'login' ? t('noAccount') : t('hasAccount')}
        </button>
      </div>
    </main>
  )
}

export default Auth
