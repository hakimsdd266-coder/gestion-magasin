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
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">{t('adminPendingTitle')}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 text-xs"
            >
              {lang === 'fr' ? 'العربية' : 'FR'}
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-gray-500"
            >
              {t('logout')}
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500 text-center py-8">{t('loadingText')}</p>}

        {!loading && pending.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
            {t('adminNoPending')}
          </div>
        )}

        <div className="space-y-3">
          {pending.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="font-medium text-gray-800">{p.email}</p>
              {p.full_name && <p className="text-sm text-gray-500">{p.full_name}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {t('registeredOn')} {new Date(p.created_at).toLocaleDateString('fr-FR')}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => traiterDemande(p.id, 'approved')}
                  disabled={actionId === p.id}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
                >
                  {t('approve')}
                </button>
                <button
                  onClick={() => traiterDemande(p.id, 'rejected')}
                  disabled={actionId === p.id}
                  className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
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
