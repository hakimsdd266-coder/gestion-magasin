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
    pendingTitle: 'En attente de validation',
    pendingMessage: "Votre compte a été créé avec succès. Un administrateur doit valider votre inscription avant que vous puissiez accéder à votre magasin.",
    logout: 'Se déconnecter',
    adminPendingTitle: 'Demandes en attente',
    adminNoPending: 'Aucune demande en attente',
    approve: 'Approuver',
    reject: 'Refuser',
    registeredOn: 'Inscrit le',
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
    pendingTitle: 'في انتظار الموافقة',
    pendingMessage: 'تم إنشاء حسابك بنجاح. يجب على المسؤول الموافقة على تسجيلك قبل أن تتمكن من الوصول إلى متجرك.',
    logout: 'تسجيل الخروج',
    adminPendingTitle: 'الطلبات المعلقة',
    adminNoPending: 'لا توجد طلبات معلقة',
    approve: 'موافقة',
    reject: 'رفض',
    registeredOn: 'تاريخ التسجيل',
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
