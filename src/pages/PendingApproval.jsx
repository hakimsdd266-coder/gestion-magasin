import { supabase } from '../lib/supabase'

function PendingApproval() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
        <span className="text-2xl">⏳</span>
      </div>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">En attente de validation</h1>
      <p className="text-gray-600 mb-8">
        Votre compte a été créé avec succès. Un administrateur doit valider votre inscription avant que vous puissiez accéder à votre magasin.
      </p>
      <button
        onClick={() => supabase.auth.signOut()}
        className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium"
      >
        Se déconnecter
      </button>
    </div>
  )
}

export default PendingApproval
