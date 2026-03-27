export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4 h-20" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    </div>
  )
}
