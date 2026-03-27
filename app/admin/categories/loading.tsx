export default function Loading() {
  return (
    <div className="px-4 py-6 md:p-8 max-w-2xl animate-pulse">
      <div className="h-7 w-36 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="flex gap-3 mb-6">
        <div className="flex-1 h-11 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-11 w-24 rounded-full" style={{ background: 'rgba(79,156,249,0.15)' }} />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#162236', border: '1px solid #1E2E45' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #1E2E45' }}>
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 w-16 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="h-7 w-12 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-7 w-14 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
