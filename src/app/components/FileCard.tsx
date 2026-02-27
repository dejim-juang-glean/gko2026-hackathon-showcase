import { DriveFile, getMimeTypeLabel } from "../../lib/drive"

interface FileCardProps {
  file: DriveFile
  compact?: boolean
}

export default function FileCard({ file, compact }: FileCardProps) {
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

  if (compact) {
    return (
      <a
        href={file.webViewLink ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm hover:border-blue-300 transition-all duration-200 group"
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
    )
  }

  return (
    <a
      href={file.webViewLink ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
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
            <p className="text-xs text-gray-400">{modifiedDate}</p>
          )}
          {formatSize(file.size) && (
            <p className="text-xs text-gray-400">· {formatSize(file.size)}</p>
          )}
        </div>
      </div>
    </a>
  )
}
