export default function Loading() {
  return (
    <div className="px-4 py-6 md:p-8 animate-pulse">
      <div className="h-7 w-64 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-24" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl h-64" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="glass rounded-2xl h-64" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  )
}
