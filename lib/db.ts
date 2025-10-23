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

const mem: Suggestion[] = []

export function addSuggestion(s: Omit<Suggestion, 'id' | 'createdAt'>): Suggestion {
  const row: Suggestion = { id: crypto.randomUUID(), createdAt: Date.now(), ...s }
  mem.unshift(row)
  return row
}

export function listSuggestions(): Suggestion[] {
  return mem
}

