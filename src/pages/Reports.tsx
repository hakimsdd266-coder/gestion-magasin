import { useState, useEffect } from 'react'
import {
  Plus, X, Trash2, TrendingUp, TrendingDown, Receipt,
  Home, Zap, Droplet, Package, Users, Truck, MoreHorizontal,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import ConfirmModal from '../components/ConfirmModal'
import TrendChart from '../components/TrendChart'
import SkeletonList from '../components/SkeletonList'
import { useToast } from '../lib/toast.jsx'
import { useLanguage } from '../lib/i18n.jsx'

const CATEGORIES = ['rent', 'electricity', 'water', 'supplies', 'salaries', 'transport', 'other']

const CATEGORY_ICONS = {
  rent: Home,
  electricity: Zap,
  water: Droplet,
  supplies: Package,
  salaries: Users,
  transport: Truck,
  other: MoreHorizontal,
}

const CATEGORY_BADGE = {
  rent: 'icon-badge-violet',
  electricity: 'icon-badge-amber',
  water: 'icon-badge-sky',
  supplies: 'icon-badge-pink',
  salaries: 'icon-badge-emerald',
  transport: 'icon-badge-fuchsia',
  other: 'icon-badge-neutral',
}

const getRange = (period) => {
  const now = new Date()
  let start
  if (period === 'day') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return { start: start.toISOString(), end: now.toISOString() }
}

function Reports({ storeId }) {
  const { t, lang } = useLanguage()
  const { showToast } = useToast()
  const [period, setPeriod] = useState('day')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ revenue: 0, cost: 0, totalExpenses: 0, profit: 0 })
  const [expenses, setExpenses] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ category: 'rent', amount: '', description: '', date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [trendRange, setTrendRange] = useState(7)
  const [trendData, setTrendData] = useState([])

  const charger = async () => {
    setLoading(true)
    const { start, end } = getRange(period)

    const [{ data: sales, error: salesErr }, { data: exp, error: expErr }] = await Promise.all([
      supabase
        .from('sales')
        .select('id, total, created_at, sale_items(quantity, unit_price, subtotal, products(purchase_price))')
        .eq('store_id', storeId)
        .gte('created_at', start)
        .lte('created_at', end),
      supabase
        .from('expenses')
        .select('*')
        .eq('store_id', storeId)
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: false }),
    ])

    if (salesErr) console.error(salesErr)
    if (expErr) console.error(expErr)

    const revenue = (sales || []).reduce((sum, s) => sum + Number(s.total), 0)
    const cost = (sales || []).reduce(
      (sum, s) =>
        sum +
        (s.sale_items || []).reduce(
          (isum, item) => isum + item.quantity * (item.products?.purchase_price || 0),
          0
        ),
      0
    )
    const totalExpenses = (exp || []).reduce((sum, e) => sum + Number(e.amount), 0)

    setStats({ revenue, cost, totalExpenses, profit: revenue - cost - totalExpenses })
    setExpenses(exp || [])
    setLoading(false)
  }

  useEffect(() => { charger() }, [storeId, period])

  const chargerTendance = async (range) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - (range - 1))
    start.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('sales')
      .select('total, created_at')
      .eq('store_id', storeId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    if (error) {
      console.error(error)
      return
    }

    const buckets = []
    for (let i = 0; i < range; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      buckets.push({ date: d, value: 0 })
    }
    ;(data || []).forEach((s) => {
      const jour = new Date(s.created_at)
      jour.setHours(0, 0, 0, 0)
      const idx = Math.round((jour.getTime() - start.getTime()) / 86400000)
      if (buckets[idx]) buckets[idx].value += Number(s.total)
    })

    const localeCode = lang === 'ar' ? 'ar-DZ' : 'fr-FR'
    setTrendData(
      buckets.map((b) => ({
        label: range === 7
          ? b.date.toLocaleDateString(localeCode, { weekday: 'short' })
          : b.date.toLocaleDateString(localeCode, { day: '2-digit', month: '2-digit' }),
        value: b.value,
      }))
    )
  }

  useEffect(() => { chargerTendance(trendRange) }, [storeId, trendRange])

  const ouvrirAjout = () => {
    setForm({ category: 'rent', amount: '', description: '', date: new Date().toISOString().slice(0, 10) })
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase.from('expenses').insert({
      store_id: storeId,
      category: form.category,
      amount: parseFloat(form.amount) || 0,
      description: form.description || null,
      created_at: new Date(form.date + 'T12:00:00').toISOString(),
    })

    if (error) {
      setError(t('errorSaving'))
      setSaving(false)
      showToast(t('errorSaving'), 'error')
      return
    }

    setSaving(false)
    setModalOpen(false)
    showToast(t('expenseSaved'), 'success')
    charger()
  }

  const supprimer = (id) => setConfirmDeleteId(id)

  const confirmerSuppression = async () => {
    const id = confirmDeleteId
    setConfirmDeleteId(null)
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) {
      console.error(error)
      showToast(t('errorSaving'), 'error')
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      showToast(t('expenseDeleted'), 'success')
    }
  }

  const localeCode = lang === 'ar' ? 'ar-DZ' : 'fr-FR'
  const isProfit = stats.profit >= 0

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 py-6 max-w-md mx-auto">
        <h1 className="heading text-xl mb-4">{t('reportsTitle')}</h1>

        <div className="flex gap-2 mb-4">
          {['day', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                period === p
                  ? 'bg-gradient-to-br from-primary-from to-primary-to text-white shadow-glow-violet'
                  : 'bg-white/5 text-violet-300/70 border border-white/10'
              }`}
            >
              {t(p === 'day' ? 'periodDay' : p === 'week' ? 'periodWeek' : 'periodMonth')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="skeleton-block h-24 rounded-2xl" />
            <div className="grid grid-cols-3 gap-2.5">
              <div className="skeleton-block h-20 rounded-2xl" />
              <div className="skeleton-block h-20 rounded-2xl" />
              <div className="skeleton-block h-20 rounded-2xl" />
            </div>
            <div className="skeleton-block h-32 rounded-2xl" />
            <SkeletonList count={3} />
          </div>
        ) : (
          <>
            <div className="stat-card mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="stat-card-label">{t('profitLabel')}</span>
                <div className={`icon-badge icon-badge-sm ${isProfit ? 'icon-badge-emerald' : 'icon-badge-rose'}`}>
                  {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
              </div>
              <p className={`stat-card-value ${isProfit ? 'text-success' : 'text-danger'}`}>
                {stats.profit.toFixed(2)} {t('currency')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-6">
              <div className="glass-card p-3.5">
                <div className="icon-badge icon-badge-sm icon-badge-sky mb-2">
                  <TrendingUp size={15} />
                </div>
                <p className="text-[11px] text-muted mb-0.5 leading-tight">{t('revenueLabel')}</p>
                <p className="font-semibold text-violet-50 text-sm">{stats.revenue.toFixed(2)}</p>
              </div>
              <div className="glass-card p-3.5">
                <div className="icon-badge icon-badge-sm icon-badge-amber mb-2">
                  <Package size={15} />
                </div>
                <p className="text-[11px] text-muted mb-0.5 leading-tight">{t('costLabel')}</p>
                <p className="font-semibold text-violet-50 text-sm">{stats.cost.toFixed(2)}</p>
              </div>
              <div className="glass-card p-3.5">
                <div className="icon-badge icon-badge-sm icon-badge-rose mb-2">
                  <Receipt size={15} />
                </div>
                <p className="text-[11px] text-muted mb-0.5 leading-tight">{t('expensesLabel')}</p>
                <p className="font-semibold text-violet-50 text-sm">{stats.totalExpenses.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-muted">{t('trendTitle')}</h2>
              <div className="flex gap-1.5">
                {[7, 30].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTrendRange(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      trendRange === r
                        ? 'bg-gradient-to-br from-primary-from to-primary-to text-white'
                        : 'bg-white/5 text-violet-300/60 border border-white/10'
                    }`}
                  >
                    {r}j
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <TrendChart data={trendData} currency={t('currency')} />
            </div>

            <h2 className="text-sm font-medium text-muted mb-2">{t('expensesHistory')}</h2>

            {expenses.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><Receipt size={26} /></div>
                <p className="empty-state-title">{t('noExpensesYet')}</p>
              </div>
            )}

            <div className="space-y-2.5">
              {expenses.map((exp) => {
                const CatIcon = CATEGORY_ICONS[exp.category] || MoreHorizontal
                const badgeClass = CATEGORY_BADGE[exp.category] || 'icon-badge-neutral'
                const label = exp.category.charAt(0).toUpperCase() + exp.category.slice(1)
                return (
                  <div key={exp.id} className="list-row">
                    <div className={`icon-badge ${badgeClass}`}>
                      <CatIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-violet-50">{t(`expenseCategory${label}`)}</span>
                        <p className="text-xs text-violet-300/50">
                          {new Date(exp.created_at).toLocaleDateString(localeCode, { day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-muted mt-0.5 truncate">{exp.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-violet-50">{Number(exp.amount).toFixed(2)}</span>
                      <button onClick={() => supprimer(exp.id)} className="action-icon-btn action-icon-btn-delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <button
        onClick={ouvrirAjout}
        className="fixed bottom-24 right-4 fab z-40"
      >
        <Plus size={26} />
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50">
          <div className="surface rounded-t-3xl w-full p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="icon-badge icon-badge-sm icon-badge-rose">
                <Receipt size={18} />
              </div>
              <h2 className="heading text-lg flex-1">{t('addExpense')}</h2>
              <button onClick={() => setModalOpen(false)} className="action-icon-btn bg-white/5 text-violet-300/60 hover:text-violet-100 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`expenseCategory${c.charAt(0).toUpperCase() + c.slice(1)}`)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                placeholder={t('expenseAmount')}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="input-field"
              />

              <input
                type="text"
                placeholder={t('expenseDescription')}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
              />

              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="input-field"
              />

              {error && <p className="text-danger text-sm">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? t('saving') : t('save')}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDeleteId}
        title={t('confirmDeleteExpense')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={confirmerSuppression}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

export default Reports
