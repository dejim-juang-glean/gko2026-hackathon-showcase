import { auth, signOut } from "../../auth"
import { getCompletedFolders, DriveFolder } from "../lib/drive"
import { redirect } from "next/navigation"
import FileCard from "./components/FileCard"

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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            <p className="font-medium">Error loading files</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center mt-20">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-500">No completed folders found.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {folders.map((folder) => (
              <section key={folder.id}>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{folder.name}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {folder.files.length} {folder.files.length === 1 ? "file" : "files"}
                </p>
                {folder.files.length === 0 ? (
                  <p className="text-sm text-gray-400">No files in this folder.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {folder.files.map((file) => (
                      <FileCard key={file.id} file={file} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
