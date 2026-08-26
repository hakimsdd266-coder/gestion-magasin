function TrendChart({ data, currency }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const points = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50
    const y = 100 - (d.value / max) * 88
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L 100 100 L 0 100 Z`
  const last = points[points.length - 1]
  const totalPeriode = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="glass-card p-4">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs text-muted">{currency}</span>
        <span className="font-display font-semibold text-violet-50">{totalPeriode.toFixed(0)} {currency}</span>
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-28">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {data.length > 1 && <path d={areaPath} fill="url(#trendFill)" stroke="none" />}
        {data.length > 1 && (
          <path d={linePath} fill="none" stroke="#c4b5fd" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        )}
        {last && (
          <circle cx={last.x} cy={last.y} r="2.2" fill="#e879f9" vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      <div className="flex justify-between mt-2 text-[10px] text-violet-300/40">
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

export default TrendChart
