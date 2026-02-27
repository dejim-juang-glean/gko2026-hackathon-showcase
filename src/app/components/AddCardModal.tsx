"use client"

import { useState } from "react"
import type { CustomCard } from "@/lib/cards"

const FILE_TYPES = [
  { label: "Google Doc", value: "application/vnd.google-apps.document" },
  { label: "Google Slides", value: "application/vnd.google-apps.presentation" },
  { label: "Video", value: "video/mp4" },
  { label: "PDF", value: "application/pdf" },
  { label: "Link / Other", value: "text/html" },
]

interface AddCardModalProps {
  folderId: string
  onClose: () => void
  onAdd: (card: CustomCard) => void
}

export default function AddCardModal({ folderId, onClose, onAdd }: AddCardModalProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [mimeType, setMimeType] = useState(FILE_TYPES[0].value)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/cards/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), url: url.trim(), mimeType, folderId }),
      })
      if (res.ok) {
        const { card } = await res.json()
        onAdd(card)
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Card</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Card name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
            <select
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {FILE_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !url.trim()}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
