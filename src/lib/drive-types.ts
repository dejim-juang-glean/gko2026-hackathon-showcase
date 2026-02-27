export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  webViewLink?: string
  modifiedTime?: string
  iconLink?: string
  size?: string
}

export interface DriveFolder {
  id: string
  name: string
  files: DriveFile[]
}

export function getMimeTypeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    "application/vnd.google-apps.document": "Google Doc",
    "application/vnd.google-apps.spreadsheet": "Google Sheet",
    "application/vnd.google-apps.presentation": "Google Slides",
    "application/vnd.google-apps.folder": "Folder",
    "application/vnd.google-apps.video": "Google Video",
    "application/vnd.google-apps.audio": "Google Audio",
    "application/vnd.google-apps.photo": "Google Photo",
    "application/vnd.google-apps.form": "Google Form",
    "application/vnd.google-apps.site": "Google Site",
    "application/pdf": "PDF",
    "image/png": "PNG Image",
    "image/jpeg": "JPEG Image",
    "image/gif": "GIF Image",
    "image/svg+xml": "SVG Image",
    "video/mp4": "Video",
    "video/quicktime": "Video",
    "audio/mpeg": "Audio",
    "text/plain": "Text File",
    "text/csv": "CSV",
    "application/zip": "ZIP Archive",
  }
  return map[mimeType] ?? (mimeType.split("/")[1]?.toUpperCase() ?? "File")
}
