export default function Loading() {
  return (
    <div className="px-4 py-6 md:p-8 animate-pulse">
      <div className="h-7 w-52 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="rounded-2xl overflow-hidden" style={{ background: '#162236', border: '1px solid #1E2E45' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: '1px solid #1E2E45' }}>
            <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 w-48 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-7 w-14 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
