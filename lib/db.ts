export type EnchantPick = { name: string; percent: number }
export type Suggestion = {
  id: string
  createdAt: number
  itemName: string
  itemShortcode: string
  enchants: EnchantPick[]
  skinUrl?: string
  skinImage?: string
}

// Optional Vercel KV (falls back to in-memory during local dev without envs)
let kv: any | undefined
try {
  // Lazy require to avoid build-time issues if envs are missing locally
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@vercel/kv')
  kv = mod.kv
} catch {}

const MEM_KEY: Suggestion[] = []
const LIST_KEY = 'suggestions'

export async function addSuggestion(s: Omit<Suggestion, 'id' | 'createdAt'>): Promise<Suggestion> {
  const row: Suggestion = { id: crypto.randomUUID(), createdAt: Date.now(), ...s }
  if (kv) {
    // Store newest first
    await kv.lpush(LIST_KEY, JSON.stringify(row))
  } else {
    MEM_KEY.unshift(row)
  }
  return row
}

export async function listSuggestions(): Promise<Suggestion[]> {
  if (kv) {
    const raw: any[] = await kv.lrange(LIST_KEY, 0, -1)
    return raw.map((r: any) => typeof r === 'string' ? JSON.parse(r) : r)
  }
  return MEM_KEY
}

