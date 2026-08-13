import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import PendingApproval from './pages/PendingApproval'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    supabase
      .from('profiles')
      .select('status, role')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setProfile(data)
        setLoading(false)
      })
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  if (!session) return <Auth />

  if (profile?.status === 'pending') return <PendingApproval />

  if (profile?.status === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <h1 className="text-xl font-semibold text-red-600 mb-2">Compte refusé</h1>
        <p className="text-gray-600 mb-6">Votre demande d'inscription a été refusée par l'administrateur.</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium"
        >
          Se déconnecter
        </button>
      </div>
    )
  }

  if (profile?.role === 'admin') return <AdminDashboard />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-semibold text-blue-600">App prête</h1>
    </div>
  )
}

export default App
