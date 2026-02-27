import { auth, signOut } from "../../auth"
import { getCompletedFolders, DriveFolder } from "../lib/drive"
import { getWinners, getPlacementStyle } from "@/lib/teams"
import { getHiddenIds, getCustomCards } from "@/lib/cards"
import { redirect } from "next/navigation"
import DashboardClient from "./components/DashboardClient"

export default async function HomePage() {
  const session = await auth()

  if (!session || !session.accessToken) {
    redirect("/login")
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!
  const folderName = process.env.GOOGLE_DRIVE_FOLDER_NAME ?? "Drive Files"

  let folders: DriveFolder[] = []
  let error: string | null = null

  try {
    folders = await getCompletedFolders(session.accessToken, folderId)
  } catch (e) {
    error = "Failed to load Drive files. Please try refreshing the page."
    console.error("Drive API error:", e)
  }

  const [hiddenIds, customCards] = await Promise.all([
    getHiddenIds(),
    getCustomCards(),
  ])

  const winners = getWinners().map((team) => ({
    team,
    style: getPlacementStyle(team.placement)!,
    folder: folders.find((f) => f.name.includes(team.driveFolderMatch)),
  }))

  const winnerFolderIds = winners
    .map((w) => w.folder?.id)
    .filter((id): id is string => Boolean(id))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{folderName}</h1>
              <p className="text-xs text-gray-500">Signed in as {session.user?.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <DashboardClient
        folders={folders}
        winners={winners}
        winnerFolderIds={winnerFolderIds}
        initialHiddenIds={hiddenIds}
        initialCustomCards={customCards}
        error={error}
      />
    </main>
  )
}
