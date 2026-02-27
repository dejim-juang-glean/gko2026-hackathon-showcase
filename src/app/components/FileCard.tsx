"use client"

import { DriveFile, getMimeTypeLabel } from "../../lib/drive-types"

interface FileCardProps {
  file: DriveFile
  compact?: boolean
  isHidden?: boolean
  onHide?: (id: string, isHidden: boolean) => void
  onDelete?: (id: string) => void
}

export default function FileCard({ file, compact, isHidden, onHide, onDelete }: FileCardProps) {
  const typeLabel = getMimeTypeLabel(file.mimeType)
  const modifiedDate = file.modifiedTime
    ? new Date(file.modifiedTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  const formatSize = (size?: string) => {
    if (!size) return null
    const bytes = parseInt(size)
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isFolder = file.mimeType === "application/vnd.google-apps.folder"
  const link = file.webViewLink ?? "#"

  const actionButtons = (onHide || onDelete) ? (
    <div className={`absolute top-2 right-2 z-10 flex gap-1 ${isHidden ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(file.id)
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 text-red-400 hover:bg-white hover:text-red-600 shadow-sm transition"
          title="Delete card"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
      {onHide && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onHide(file.id, !!isHidden)
          }}
          className={`w-7 h-7 flex items-center justify-center rounded-full transition ${
            isHidden
              ? "bg-blue-100 text-blue-600"
              : "bg-white/80 text-gray-500 hover:bg-white hover:text-gray-700"
          } shadow-sm`}
          title={isHidden ? "Show card" : "Hide card"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isHidden ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            )}
          </svg>
        </button>
      )}
    </div>
  ) : null

  if (compact) {
    return (
      <div className="relative group">
        {actionButtons}
        {isHidden && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
            <span className="bg-gray-800/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">Hidden</span>
          </div>
        )}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`block bg-gray-50 rounded-lg overflow-hidden hover:shadow-sm transition-all duration-200 ${
            isHidden
              ? "opacity-50 border-2 border-dashed border-gray-300"
              : "border border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="h-20 bg-gray-100 flex items-center justify-center overflow-hidden">
            {file.thumbnailLink ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" />
            ) : file.iconLink ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.iconLink} alt="" className="w-6 h-6" />
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d={isFolder
                    ? "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  }
                />
              </svg>
            )}
          </div>
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-gray-700 truncate group-hover:text-blue-700" title={file.name}>
              {file.name}
            </p>
          </div>
        </a>
      </div>
    )
  }

  return (
    <div className="relative group">
      {actionButtons}
      {isHidden && (
        <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
          <span className="bg-gray-800/70 text-white text-xs font-medium px-2 py-1 rounded">Hidden</span>
        </div>
      )}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`block bg-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 ${
          isHidden
            ? "opacity-50 border-2 border-dashed border-gray-300"
            : "border border-gray-200 hover:border-blue-300"
        }`}
      >
        {/* Thumbnail or placeholder */}
        <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
          {file.thumbnailLink ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.thumbnailLink}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              {file.iconLink ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.iconLink} alt="" className="w-10 h-10" />
              ) : (
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isFolder ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  )}
                </svg>
              )}
              <span className="text-xs font-medium">{typeLabel}</span>
            </div>
          )}
        </div>

        {/* File info */}
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">{typeLabel}</p>
          <div className="flex items-center gap-2 mt-1">
            {modifiedDate && (
              <p className="text-xs text-gray-400">
                {onDelete ? `Added ${modifiedDate}` : modifiedDate}
              </p>
            )}
            {formatSize(file.size) && (
              <p className="text-xs text-gray-400">· {formatSize(file.size)}</p>
            )}
          </div>
        </div>
      </a>
    </div>
  )
}
