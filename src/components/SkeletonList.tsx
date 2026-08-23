function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.035] border border-white/[0.06]">
          <div className="skeleton-block w-11 h-11 rounded-2xl shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="skeleton-block h-3.5 rounded-md mb-2" style={{ width: `${55 + ((i * 13) % 30)}%` }} />
            <div className="skeleton-block h-2.5 rounded-md" style={{ width: `${30 + ((i * 17) % 25)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default SkeletonList
