import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function AdminDashboard() {
  const { lang, setLang, t } = useLanguage()
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)

  const chargerDemandes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) console.error(error)
    else setPending(data)
    setLoading(false)
  }

  useEffect(() => {
    chargerDemandes()
  }, [])

  const traiterDemande = async (id, nouveauStatus) => {
    setActionId(id)
    const { error } = await supabase
      .from('profiles')
      .update({ status: nouveauStatus })
      .eq('id', id)

    if (error) {
      console.error(error)
    } else {
      setPending((prev) => prev.filter((p) => p.id !== id))
    }
    setActionId(null)
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading text-xl">{t('adminPendingTitle')}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-violet-200 text-xs backdrop-blur-xl hover:bg-white/10 transition-colors"
            >
              {lang === 'fr' ? 'العربية' : 'FR'}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-muted hover:text-violet-100 transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>

        {loading && <p className="text-muted text-center py-8">{t('loadingText')}</p>}

        {!loading && pending.length === 0 && (
          <div className="glass-card p-8 text-center text-muted">
            {t('adminNoPending')}
          </div>
        )}

        <div className="space-y-3">
          {pending.map((p) => (
            <div key={p.id} className="glass-card p-4">
              <p className="font-medium text-violet-50">{p.email}</p>
              {p.full_name && <p className="text-sm text-muted">{p.full_name}</p>}
              <p className="text-xs text-violet-300/50 mt-1">
                {t('registeredOn')} {new Date(p.created_at).toLocaleDateString('fr-FR')}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => traiterDemande(p.id, 'approved')}
                  disabled={actionId === p.id}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {t('approve')}
                </button>
                <button
                  onClick={() => traiterDemande(p.id, 'rejected')}
                  disabled={actionId === p.id}
                  className="btn-secondary flex-1 disabled:opacity-50"
                >
                  {t('reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
