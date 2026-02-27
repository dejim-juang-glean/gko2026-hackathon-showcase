"use client"

import { useState, useCallback } from "react"
import { DriveFile, DriveFolder } from "@/lib/drive-types"
import { PlacementStyle } from "@/lib/teams"
import type { CustomCard } from "@/lib/cards"
import FileCard from "./FileCard"
import AddCardModal from "./AddCardModal"

interface WinnerEntry {
  team: {
    name: string
    placement: number | null
    award: string | null
    driveFolderMatch: string
  }
  style: PlacementStyle
  folder?: DriveFolder
}

interface DashboardClientProps {
  folders: DriveFolder[]
  winners: WinnerEntry[]
  winnerFolderIds: string[]
  initialHiddenIds: string[]
  initialCustomCards: CustomCard[]
  error: string | null
}

function customCardToDriveFile(card: CustomCard): DriveFile {
  return {
    id: card.id,
    name: card.name,
    mimeType: card.mimeType,
    webViewLink: card.url,
    modifiedTime: card.createdAt,
  }
}

export default function DashboardClient({
  folders,
  winners,
  winnerFolderIds,
  initialHiddenIds,
  initialCustomCards,
  error,
}: DashboardClientProps) {
  const [showHidden, setShowHidden] = useState(false)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set(initialHiddenIds))
  const [customCards, setCustomCards] = useState<CustomCard[]>(initialCustomCards)
  const [modalFolderId, setModalFolderId] = useState<string | null>(null)

  const toggleHide = useCallback(async (cardId: string, isCurrentlyHidden: boolean) => {
    const action = isCurrentlyHidden ? "show" : "hide"
    const newSet = new Set(hiddenIds)
    if (action === "hide") {
      newSet.add(cardId)
    } else {
      newSet.delete(cardId)
    }
    setHiddenIds(newSet)

    await fetch("/api/cards/hide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, action }),
    })
  }, [hiddenIds])

  const handleAddCard = useCallback((card: CustomCard) => {
    setCustomCards((prev) => [...prev, card])
  }, [])

  const handleDeleteCard = useCallback(async (cardId: string) => {
    setCustomCards((prev) => prev.filter((c) => c.id !== cardId))
    await fetch(`/api/cards/custom?id=${encodeURIComponent(cardId)}`, { method: "DELETE" })
  }, [])

  const customCardIds = new Set(customCards.map((c) => c.id))

  const winnerFolderIdSet = new Set(winnerFolderIds)
  const remainingFolders = folders.filter((f) => !winnerFolderIdSet.has(f.id))

  const getFilesForFolder = (folder: DriveFolder): DriveFile[] => {
    const folderCustomCards = customCards
      .filter((c) => c.folderId === folder.id)
      .map(customCardToDriveFile)
    return [...folder.files, ...folderCustomCards]
  }

  const filterFiles = (files: DriveFile[]): DriveFile[] => {
    if (showHidden) return files
    return files.filter((f) => !hiddenIds.has(f.id))
  }

  const hiddenCount = hiddenIds.size

  return (
    <>
      {/* Winners */}
      {!error && folders.length > 0 && (
        <div className="bg-gradient-to-b from-indigo-50 to-gray-50 border-b border-gray-200 px-6 py-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hackathon Winners</h2>
            <p className="text-sm text-gray-500 mb-8">Congratulations to our top teams!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {winners.map((w) => {
                const allFiles = w.folder ? getFilesForFolder(w.folder) : []
                const visibleFiles = filterFiles(allFiles)
                return (
                  <div
                    key={w.team.name}
                    className={`bg-white rounded-xl border-2 ${w.style.border} p-6 shadow-sm`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${w.style.color} mx-auto mb-3 flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">{w.team.placement}</span>
                    </div>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${w.style.badge} mb-2`}>
                      {w.team.award}
                    </span>
                    <p className="text-lg font-semibold text-gray-900">{w.team.name}</p>
                    {visibleFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {visibleFiles.map((file) => (
                          <FileCard
                            key={file.id}
                            file={file}
                            compact
                            isHidden={hiddenIds.has(file.id)}
                            onHide={toggleHide}
                            onDelete={customCardIds.has(file.id) ? handleDeleteCard : undefined}
                          />
                        ))}
                      </div>
                    )}
                    {w.folder && (
                      <button
                        onClick={() => setModalFolderId(w.folder!.id)}
                        className="mt-3 w-full py-1.5 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-500 transition"
                      >
                        + Add card
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Toggle + stats bar */}
        {!error && folders.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition ${
                showHidden
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showHidden ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                )}
              </svg>
              {showHidden ? "Showing hidden" : "Show hidden"}
              {hiddenCount > 0 && (
                <span className="bg-gray-200 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                  {hiddenCount}
                </span>
              )}
            </button>
          </div>
        )}

        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            <p className="font-medium">Error loading files</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : remainingFolders.length === 0 ? (
          <div className="text-center mt-20">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-500">No completed folders found.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {remainingFolders.map((folder) => {
              const allFiles = getFilesForFolder(folder)
              const visibleFiles = filterFiles(allFiles)
              const totalCount = allFiles.length
              const hiddenInFolder = allFiles.filter((f) => hiddenIds.has(f.id)).length

              return (
                <section key={folder.id}>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{folder.name}</h2>
                    <button
                      onClick={() => setModalFolderId(folder.id)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded hover:border-blue-400 hover:text-blue-500 transition text-sm"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {totalCount} {totalCount === 1 ? "file" : "files"}
                    {hiddenInFolder > 0 && !showHidden && (
                      <span className="text-gray-400"> ({hiddenInFolder} hidden)</span>
                    )}
                  </p>
                  {visibleFiles.length === 0 ? (
                    <p className="text-sm text-gray-400">No files in this folder.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {visibleFiles.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          isHidden={hiddenIds.has(file.id)}
                          onHide={toggleHide}
                          onDelete={customCardIds.has(file.id) ? handleDeleteCard : undefined}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalFolderId && (
        <AddCardModal
          folderId={modalFolderId}
          onClose={() => setModalFolderId(null)}
          onAdd={handleAddCard}
        />
      )}
    </>
  )
}
