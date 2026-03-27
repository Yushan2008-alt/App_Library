/** Server-side OG image fetcher — shared by POST and PUT /api/books */
export async function fetchOgImageFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AppLibraryBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const patterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    ]
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) {
        const image = match[1]
        return image.startsWith('http') ? image : new URL(image, new URL(url).origin).toString()
      }
    }
    return null
  } catch {
    return null
  }
}
