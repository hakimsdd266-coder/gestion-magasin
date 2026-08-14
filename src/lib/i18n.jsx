import { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  fr: {
    login: 'Connexion',
    signup: 'Créer un compte',
    email: 'Email',
    password: 'Mot de passe',
    loginButton: 'Se connecter',
    signupButton: "S'inscrire",
    noAccount: "Pas encore de compte ? S'inscrire",
    hasAccount: 'Déjà un compte ? Se connecter',
    loadingText: 'Chargement...',
    accountCreated: "Compte créé ! Attendez la validation de l'administrateur.",
    errorEmailUsed: 'Cet email est déjà utilisé.',
    errorInvalidCredentials: 'Email ou mot de passe incorrect.',
    errorPasswordShort: 'Le mot de passe doit contenir au moins 6 caractères.',
  },
  ar: {
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginButton: 'تسجيل الدخول',
    signupButton: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟ سجل الآن',
    hasAccount: 'لديك حساب بالفعل؟ سجل الدخول',
    loadingText: 'جارٍ التحميل...',
    accountCreated: 'تم إنشاء الحساب! انتظر موافقة المسؤول.',
    errorEmailUsed: 'هذا البريد الإلكتروني مستخدم بالفعل.',
    errorInvalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    errorPasswordShort: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
  },
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr')

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const t = (key) => translations[lang][key] || key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
