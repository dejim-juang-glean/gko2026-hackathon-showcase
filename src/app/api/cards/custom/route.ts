import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getCustomCards, saveCustomCards } from "@/lib/cards"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, url, mimeType, folderId } = body as {
    name: string
    url: string
    mimeType: string
    folderId?: string
  }

  if (!name || !url || !mimeType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const cards = await getCustomCards()
  const newCard = {
    id: uuidv4(),
    name,
    url,
    mimeType,
    folderId,
    createdAt: new Date().toISOString(),
  }
  cards.push(newCard)
  await saveCustomCards(cards)

  return NextResponse.json({ card: newCard })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const cards = await getCustomCards()
  const filtered = cards.filter((c) => c.id !== id)
  await saveCustomCards(filtered)

  return NextResponse.json({ cards: filtered })
}
