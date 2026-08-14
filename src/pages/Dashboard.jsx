import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import Products from './Products'

function Placeholder({ texte }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pb-20">
      <p className="text-gray-500">{texte}</p>
    </div>
  )
}

function Dashboard({ storeId }) {
  const [tab, setTab] = useState('products')

  return (
    <div>
      {tab === 'home' && <Placeholder texte="Tableau de bord — bientôt disponible" />}
      {tab === 'products' && <Products storeId={storeId} />}
      {tab === 'sale' && <Placeholder texte="Vente — bientôt disponible" />}
      {tab === 'stock' && <Placeholder texte="Stock — bientôt disponible" />}
      {tab === 'profile' && <Placeholder texte="Profil — bientôt disponible" />}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default Dashboard
