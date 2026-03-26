import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get('url')
  if (!url) return Response.json({ image: null })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AppLibraryBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return Response.json({ image: null })

    const html = await res.text()

    // Try og:image first, then twitter:image, then first large img
    const patterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    ]

    let image: string | null = null
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) {
        image = match[1]
        break
      }
    }

    // Resolve relative URLs
    if (image && !image.startsWith('http')) {
      const base = new URL(url)
      image = new URL(image, base.origin).toString()
    }

    return Response.json({ image })
  } catch {
    return Response.json({ image: null })
  }
}
