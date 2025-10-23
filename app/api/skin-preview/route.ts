function extractOgImage(html: string): string | undefined {
  const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
  if (match) return match[1]
  const match2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i)
  if (match2) return match2[1]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  if (!url) return new Response('Missing url', { status: 400 })

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    const html = await res.text()
    const og = extractOgImage(html)
    if (!og) return new Response('Not found', { status: 404 })
    return Response.json({ image: og })
  } catch (e) {
    return new Response('Failed to fetch', { status: 502 })
  }
}

