import teamsJson from "@/data/teams.json"

export interface Team {
  name: string
  teamNumber: number
  projectTitle: string
  description: string
  members: string[]
  placement: number | null
  award: string | null
  driveFolderMatch: string
}

export interface PlacementStyle {
  color: string
  border: string
  badge: string
}

const placementStyles: Record<number, PlacementStyle> = {
  1: { color: "from-yellow-400 to-amber-500", border: "border-yellow-400", badge: "bg-yellow-100 text-yellow-800" },
  2: { color: "from-gray-300 to-slate-400", border: "border-gray-300", badge: "bg-gray-100 text-gray-700" },
  3: { color: "from-amber-600 to-orange-700", border: "border-amber-600", badge: "bg-orange-100 text-orange-800" },
}

export function getAllTeams(): Team[] {
  return (teamsJson.teams as Team[]).sort((a, b) => {
    if (a.placement == null && b.placement == null) return 0
    if (a.placement == null) return 1
    if (b.placement == null) return -1
    return a.placement - b.placement
  })
}

export function getWinners(): Team[] {
  return getAllTeams().filter((t) => t.placement != null)
}

export function getTeamByName(name: string): Team | undefined {
  return (teamsJson.teams as Team[]).find((t) => t.name === name)
}

export function getPlacementStyle(placement: number | null): PlacementStyle | undefined {
  if (placement == null) return undefined
  return placementStyles[placement]
}
