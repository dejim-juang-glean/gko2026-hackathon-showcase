import { promises as fs } from "fs"
import path from "path"

export interface CustomCard {
  id: string
  name: string
  url: string
  mimeType: string
  folderId?: string
  createdAt: string
}

const HIDDEN_PATH = path.join(process.cwd(), "src/data/hidden.json")
const CUSTOM_PATH = path.join(process.cwd(), "src/data/custom-cards.json")

const KV_HIDDEN_KEY = "hidden-ids"
const KV_CUSTOM_KEY = "custom-cards"

function hasKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

async function kvGet<T>(key: string): Promise<T | null> {
  const { kv } = await import("@vercel/kv")
  return kv.get<T>(key)
}

async function kvSet(key: string, value: unknown): Promise<void> {
  const { kv } = await import("@vercel/kv")
  await kv.set(key, value)
}

export async function getHiddenIds(): Promise<string[]> {
  if (hasKV()) {
    return (await kvGet<string[]>(KV_HIDDEN_KEY)) ?? []
  }
  try {
    const raw = await fs.readFile(HIDDEN_PATH, "utf-8")
    const data = JSON.parse(raw)
    return data.hiddenIds ?? []
  } catch {
    return []
  }
}

export async function saveHiddenIds(ids: string[]): Promise<void> {
  if (hasKV()) {
    await kvSet(KV_HIDDEN_KEY, ids)
    return
  }
  await fs.writeFile(HIDDEN_PATH, JSON.stringify({ hiddenIds: ids }, null, 2) + "\n")
}

export async function getCustomCards(): Promise<CustomCard[]> {
  if (hasKV()) {
    return (await kvGet<CustomCard[]>(KV_CUSTOM_KEY)) ?? []
  }
  try {
    const raw = await fs.readFile(CUSTOM_PATH, "utf-8")
    const data = JSON.parse(raw)
    return data.cards ?? []
  } catch {
    return []
  }
}

export async function saveCustomCards(cards: CustomCard[]): Promise<void> {
  if (hasKV()) {
    await kvSet(KV_CUSTOM_KEY, cards)
    return
  }
  await fs.writeFile(CUSTOM_PATH, JSON.stringify({ cards }, null, 2) + "\n")
}
