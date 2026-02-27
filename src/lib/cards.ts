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

export async function getHiddenIds(): Promise<string[]> {
  try {
    const raw = await fs.readFile(HIDDEN_PATH, "utf-8")
    const data = JSON.parse(raw)
    return data.hiddenIds ?? []
  } catch {
    return []
  }
}

export async function saveHiddenIds(ids: string[]): Promise<void> {
  await fs.writeFile(HIDDEN_PATH, JSON.stringify({ hiddenIds: ids }, null, 2) + "\n")
}

export async function getCustomCards(): Promise<CustomCard[]> {
  try {
    const raw = await fs.readFile(CUSTOM_PATH, "utf-8")
    const data = JSON.parse(raw)
    return data.cards ?? []
  } catch {
    return []
  }
}

export async function saveCustomCards(cards: CustomCard[]): Promise<void> {
  await fs.writeFile(CUSTOM_PATH, JSON.stringify({ cards }, null, 2) + "\n")
}
