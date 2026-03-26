'use client'

export default function UserError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div style={{ padding: 40, color: '#fff', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#fca5a5', marginBottom: 16 }}>Error: {error.message}</h2>
      <pre style={{ background: '#1a1a2e', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 12, color: '#93c5fd' }}>
        {error.stack}
      </pre>
      {error.digest && <p style={{ color: '#8899BB', marginTop: 8 }}>Digest: {error.digest}</p>}
    </div>
  )
}
