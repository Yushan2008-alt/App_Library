export default function Loading() {
  return (
    <div className="px-4 py-6 md:p-8 animate-pulse">
      <div className="h-7 w-44 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="flex gap-2 mb-6 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#162236', border: '1px solid #1E2E45' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-4" style={{ borderBottom: '1px solid #1E2E45' }}>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 w-1/2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-7 w-20 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
