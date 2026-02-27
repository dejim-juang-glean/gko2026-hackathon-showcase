import { google } from "googleapis"

export type { DriveFile, DriveFolder } from "./drive-types"
export { getMimeTypeLabel } from "./drive-types"

export async function getCompletedFolders(
  accessToken: string,
  folderId: string
) {
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
        files: (filesResponse.data.files as import("./drive-types").DriveFile[]) ?? [],
      }
    })
  )

  return results
}
