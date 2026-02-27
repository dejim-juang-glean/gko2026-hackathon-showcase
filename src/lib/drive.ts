import { google } from "googleapis"

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

export async function getCompletedFolders(
  accessToken: string,
  folderId: string
): Promise<DriveFolder[]> {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })

  const drive = google.drive({ version: "v3", auth })

  // Find subfolders with "Completed" in the name
  const foldersResponse = await drive.files.list({
    q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name contains 'Completed' and trashed = false`,
    fields: "files(id,name)",
    orderBy: "name",
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  const folders = (foldersResponse.data.files ?? []) as { id: string; name: string }[]

  // Fetch files from each "Completed" folder in parallel
  const results = await Promise.all(
    folders.map(async (folder) => {
      const filesResponse = await drive.files.list({
        q: `'${folder.id}' in parents and trashed = false`,
        fields: "files(id,name,mimeType,thumbnailLink,webViewLink,modifiedTime,iconLink,size)",
        orderBy: "modifiedTime desc",
        pageSize: 100,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      })
      return {
        id: folder.id,
        name: folder.name,
        files: (filesResponse.data.files as DriveFile[]) ?? [],
      }
    })
  )

  return results
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
