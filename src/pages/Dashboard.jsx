import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import Products from './Products'
import Sale from './Sale'
import Home from './Home'
import Stock from './Stock'

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
{tab === 'home' && <Home storeId={storeId} />}
      {tab === 'products' && <Products storeId={storeId} />}
{tab === 'sale' && <Sale storeId={storeId} />}
{tab === 'stock' && <Stock storeId={storeId} />}
      {tab === 'profile' && <Placeholder texte="Profil — bientôt disponible" />}

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default Dashboard
