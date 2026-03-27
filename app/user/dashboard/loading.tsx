export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-56 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-24" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      <div className="glass rounded-2xl p-5 h-48" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}
