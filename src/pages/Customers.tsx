import { useState, useEffect } from 'react'
import { Plus, X, Search, ChevronRight, ArrowLeft, Users, Wallet, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../lib/i18n.jsx'

function Customers({ storeId }) {
  const { t, lang } = useLanguage()
  const [customers, setCustomers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [txType, setTxType] = useState('credit')
  const [form, setForm] = useState({ name: '', phone: '' })
  const [txForm, setTxForm] = useState({ amount: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const charger = async () => {
    setLoading(true)
    const [{ data: custs, error: custErr }, { data: txs, error: txErr }] = await Promise.all([
      supabase.from('customers').select('*').eq('store_id', storeId).order('name'),
      supabase.from('credit_transactions').select('*').eq('store_id', storeId).order('created_at', { ascending: false }),
    ])
    if (custErr) console.error(custErr)
    else setCustomers(custs || [])
    if (txErr) console.error(txErr)
    else setTransactions(txs || [])
    setLoading(false)
  }

  useEffect(() => { charger() }, [storeId])

  const soldeClient = (customerId) =>
    transactions
      .filter((tx) => tx.customer_id === customerId)
      .reduce((sum, tx) => sum + (tx.type === 'credit' ? Number(tx.amount) : -Number(tx.amount)), 0)

  const totalDu = customers.reduce((sum, c) => sum + Math.max(soldeClient(c.id), 0), 0)

  const filtres = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  const ouvrirAjoutClient = () => {
    setForm({ name: '', phone: '' })
    setError('')
    setAddModalOpen(true)
  }

  const handleAjoutClient = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('customers').insert({
      store_id: storeId,
      name: form.name,
      phone: form.phone || null,
    })
    if (error) {
      setError(t('errorSaving'))
      setSaving(false)
      return
    }
    setSaving(false)
    setAddModalOpen(false)
    charger()
  }

  const ouvrirTransaction = (type) => {
    setTxType(type)
    setTxForm({ amount: '', note: '' })
    setError('')
    setTxModalOpen(true)
  }

  const handleTransaction = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('credit_transactions').insert({
      customer_id: selected.id,
      store_id: storeId,
      type: txType,
      amount: parseFloat(txForm.amount) || 0,
      note: txForm.note || null,
    })
    if (error) {
      setError(t('errorSaving'))
      setSaving(false)
      return
    }
    setSaving(false)
    setTxModalOpen(false)
    charger()
  }

  const localeCode = lang === 'ar' ? 'ar-DZ' : 'fr-FR'

  if (selected) {
    const solde = soldeClient(selected.id)
    const historique = transactions.filter((tx) => tx.customer_id === selected.id)
    const initiale = selected.name.charAt(0).toUpperCase()

    return (
      <div className="min-h-screen pb-24">
        <div className="px-4 py-6 max-w-md mx-auto">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-violet-300/70 text-sm mb-4 hover:text-violet-100 transition-colors"
          >
            <div className="icon-badge icon-badge-sm icon-badge-neutral">
              <ArrowLeft size={15} />
            </div>
            {t('back')}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="icon-badge icon-badge-lg icon-badge-violet">
              <span className="font-display font-semibold text-lg">{initiale}</span>
            </div>
            <div>
              <h1 className="heading text-xl">{selected.name}</h1>
              {selected.phone && <p className="text-muted text-sm">{selected.phone}</p>}
            </div>
          </div>

          <div className="stat-card mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="stat-card-label">{t('balanceLabel')}</span>
              <div className={`icon-badge icon-badge-sm ${solde > 0 ? 'icon-badge-rose' : 'icon-badge-emerald'}`}>
                <Wallet size={16} />
              </div>
            </div>
            <p className={`stat-card-value ${solde > 0 ? 'text-danger' : 'text-success'}`}>
              {solde.toFixed(2)} {t('currency')}
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => ouvrirTransaction('credit')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors"
            >
              <ArrowUpRight size={17} />
              {t('addCredit')}
            </button>
            <button
              onClick={() => ouvrirTransaction('payment')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium bg-success/15 text-success hover:bg-success/25 transition-colors"
            >
              <ArrowDownRight size={17} />
              {t('addPayment')}
            </button>
          </div>

          <h2 className="text-sm font-medium text-muted mb-2">{t('transactionHistory')}</h2>

          {historique.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Receipt size={26} /></div>
              <p className="empty-state-title">{t('noTransactionsYet')}</p>
            </div>
          )}

          <div className="space-y-2.5">
            {historique.map((tx) => (
              <div key={tx.id} className="list-row">
                <div className={`icon-badge icon-badge-sm ${tx.type === 'credit' ? 'icon-badge-rose' : 'icon-badge-emerald'}`}>
                  {tx.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${tx.type === 'credit' ? 'text-danger' : 'text-success'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{Number(tx.amount).toFixed(2)} {t('currency')}
                  </p>
                  {tx.note && <p className="text-sm text-muted mt-0.5 truncate">{tx.note}</p>}
                </div>
                <p className="text-xs text-violet-300/50 shrink-0">
                  {new Date(tx.created_at).toLocaleDateString(localeCode, { day: '2-digit', month: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {txModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-end z-50">
            <div className="surface rounded-t-3xl w-full p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className={`icon-badge icon-badge-sm ${txType === 'credit' ? 'icon-badge-rose' : 'icon-badge-emerald'}`}>
                  {txType === 'credit' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <h2 className="heading text-lg flex-1">
                  {txType === 'credit' ? t('addCredit') : t('addPayment')}
                </h2>
                <button onClick={() => setTxModalOpen(false)} className="action-icon-btn bg-white/5 text-violet-300/60 hover:text-violet-100 hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleTransaction} className="space-y-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder={t('expenseAmount')}
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder={t('expenseDescription')}
                  value={txForm.note}
                  onChange={(e) => setTxForm({ ...txForm, note: e.target.value })}
                  className="input-field"
                />
                {error && <p className="text-danger text-sm">{error}</p>}
                <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                  {saving ? t('saving') : t('save')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="heading text-xl mb-4">{t('customersTitle')}</h1>

        <div className="stat-card mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-card-label">{t('totalOwed')}</span>
            <div className="icon-badge icon-badge-sm icon-badge-rose">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-display font-semibold text-danger">{totalDu.toFixed(2)} {t('currency')}</p>
        </div>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-300/50" />
          <input
            type="text"
            placeholder={t('searchCustomer')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {loading && <p className="text-muted text-center py-8">{t('loadingText')}</p>}

        {!loading && filtres.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={26} /></div>
            <p className="empty-state-title">{t('noCustomers')}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {filtres.map((c) => {
            const solde = soldeClient(c.id)
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="list-row w-full text-left"
              >
                <div className="icon-badge icon-badge-violet">
                  <span className="font-display font-semibold text-sm">{c.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-violet-50 truncate">{c.name}</p>
                  {c.phone && <p className="text-sm text-muted">{c.phone}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={solde > 0 ? 'badge-danger' : 'badge-ok'}>
                    {solde.toFixed(2)} {t('currency')}
                  </span>
                  <ChevronRight size={18} className="text-violet-300/40" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={ouvrirAjoutClient} className="fixed bottom-24 right-4 fab z-40">
        <Plus size={26} />
      </button>

      {addModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="surface rounded-t-3xl w-full p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-badge icon-badge-sm icon-badge-violet">
                <Users size={18} />
              </div>
              <h2 className="heading text-lg flex-1">{t('addCustomer')}</h2>
              <button onClick={() => setAddModalOpen(false)} className="action-icon-btn bg-white/5 text-violet-300/60 hover:text-violet-100 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAjoutClient} className="space-y-3">
              <input
                type="text"
                placeholder={t('customerName')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input-field"
              />
              <input
                type="tel"
                placeholder={t('customerPhone')}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
              {error && <p className="text-danger text-sm">{error}</p>}
              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-50">
                {saving ? t('saving') : t('save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
