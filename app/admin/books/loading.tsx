export default function Loading() {
  return (
    <div className="px-4 py-6 md:p-8 animate-pulse">
      <div className="h-7 w-40 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="flex gap-3 mb-6">
        <div className="flex-1 h-11 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-11 w-24 rounded-full" style={{ background: 'rgba(79,156,249,0.15)' }} />
      </div>
      <div className="glass rounded-2xl overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-10 h-14 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="h-5 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex gap-2">
              <div className="h-7 w-12 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="h-7 w-14 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
