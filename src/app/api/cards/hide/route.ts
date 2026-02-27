import { NextResponse } from "next/server"
import { getHiddenIds, saveHiddenIds } from "@/lib/cards"

export async function POST(request: Request) {
  const body = await request.json()
  const { cardId, action } = body as { cardId: string; action: "hide" | "show" }

  if (!cardId || !["hide", "show"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const ids = await getHiddenIds()
  const set = new Set(ids)

  if (action === "hide") {
    set.add(cardId)
  } else {
    set.delete(cardId)
  }

  const result = Array.from(set)
  await saveHiddenIds(result)
  return NextResponse.json({ hiddenIds: result })
}
