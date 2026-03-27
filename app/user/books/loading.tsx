export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-40 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-4 w-24 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="h-10 flex-1 min-w-48 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(12,24,50,0.65)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="aspect-[3/4]" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="p-3 space-y-2">
              <div className="h-3 w-16 rounded" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="h-3 w-full rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
