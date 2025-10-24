import { addSuggestion, listSuggestions } from '@/lib/db'

export async function GET() {
  const items = await listSuggestions()
  return Response.json(items)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { itemName, itemShortcode, enchants, skinUrl, skinImage } = body || {}

    if (!itemName || !itemShortcode || !skinUrl) {
      return new Response('Missing required fields', { status: 400 })
    }

    const cleanEnchants = Array.isArray(enchants)
      ? enchants
          .filter((e: any) => e && e.name && typeof e.percent === 'number')
          .slice(0, 3)
          .map((e: any) => ({ name: String(e.name), percent: Math.max(0, Math.min(100, Number(e.percent))) }))
      : []

    const row = await addSuggestion({ itemName, itemShortcode, enchants: cleanEnchants, skinUrl, skinImage })
    return Response.json(row, { status: 201 })
  } catch (e: any) {
    return new Response('Invalid JSON', { status: 400 })
  }
}

