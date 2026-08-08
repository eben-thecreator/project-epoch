import { useState, useRef, useCallback } from "react";
import { apiUrl, mediaUrl } from "../../lib/api";
import { ModelViewer } from "../../components/ModelViewer";
import type { HeritageAsset, MediaItem } from "./types";

interface MediaManagerProps {
  asset: HeritageAsset | null;
  onRefresh: () => void;
  onToast: (type: "success" | "error", message: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 20;

export const MediaManager = ({ asset, onRefresh, onToast }: MediaManagerProps): JSX.Element => {
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [markFirstPrimary, setMarkFirstPrimary] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => f.size <= MAX_FILE_SIZE).slice(0, MAX_FILES);
    if (valid.length < selected.length) {
      const skipped = selected.length - valid.length;
      // toast handled via callback
    }
    setPendingFiles(valid);
    e.target.value = "";
  }, []);

  const handleUpload = async () => {
    if (!asset || pendingFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      pendingFiles.forEach((f) => formData.append("files", f));
      formData.append("caption", caption);
      formData.append("markFirstAsPrimary", String(markFirstPrimary));

      const res = await fetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/upload`), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed.");
      }

      onToast("success", `Uploaded ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}.`);
      setPendingFiles([]);
      setCaption("");
      onRefresh();
    } catch (err) {
      onToast("error", err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!asset) return;
    try {
      const res = await fetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/${mediaId}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed.");
      onToast("success", "Media deleted.");
      if (previewMedia?.id === mediaId) setPreviewMedia(null);
      onRefresh();
    } catch (err) {
      onToast("error", err instanceof Error ? err.message : "Delete failed.");
    }
    setDeleteConfirm(null);
  };

  const handleSetPrimary = async (mediaId: string) => {
    if (!asset) return;
    try {
      const res = await fetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/${mediaId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!res.ok) throw new Error("Failed to set primary.");
      onToast("success", "Primary media updated.");
      onRefresh();
    } catch (err) {
      onToast("error", err instanceof Error ? err.message : "Failed to set primary.");
    }
  };

  const handleReorder = async (mediaId: string, direction: "up" | "down") => {
    if (!asset) return;
    const media = asset.media || [];
    const idx = media.findIndex((m) => m.id === mediaId);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= media.length) return;

    const updates = [
      { id: media[idx].id, sortOrder: targetIdx },
      { id: media[targetIdx].id, sortOrder: idx },
    ];

    try {
      for (const u of updates) {
        await fetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/${u.id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: u.sortOrder }),
        });
      }
      onRefresh();
    } catch {
      onToast("error", "Failed to reorder.");
    }
  };

  if (!asset) {
    return (
      <div className="bg-white rounded-xl border border-black/5 p-12 text-center">
        <p className="text-xs text-black/40 uppercase">Select an asset to manage its media</p>
      </div>
    );
  }

  const media = asset.media || [];
  const imageMedia = media.filter((m) => m.mediaType === "image");
  const otherMedia = media.filter((m) => m.mediaType !== "image");

  return (
    <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-black/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-[#111]">Media Manager</h3>
          <p className="text-[10px] text-black/40 mt-0.5">{asset.name || "Untitled"} — {media.length} file{media.length !== 1 ? "s" : ""}</p>
        </div>
        <label className="cursor-pointer text-[10px] font-bold uppercase px-3 py-2 bg-black/5 rounded-lg hover:bg-black/10 transition-colors flex items-center gap-1.5">
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.glb,.gltf,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            ref={fileInputRef}
          />
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Files
        </label>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Media Grid */}
        <div className="flex-1 p-4">
          {media.length === 0 && pendingFiles.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="w-10 h-10 mx-auto text-black/10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-black/40">No media files yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {media.map((m, idx) => (
                <div
                  key={m.id}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-colors ${
                    previewMedia?.id === m.id ? "border-[#E4002B]" : "border-transparent hover:border-black/10"
                  }`}
                  onClick={() => setPreviewMedia(m)}
                >
                  {m.mediaType === "image" ? (
                    <img src={mediaUrl(m.filePath)} alt={m.caption || ""} className="w-full h-full object-cover" />
                  ) : m.mediaType === "video" ? (
                    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  ) : m.mediaType === "audio" ? (
                    <div className="w-full h-full bg-purple-900 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  ) : m.mediaType === "model" ? (
                    <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white/50 uppercase">3D</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-black/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}

                  {m.isPrimary && m.mediaType === "image" && (
                    <div className="absolute top-1 left-1 bg-[#E4002B] text-white text-[7px] font-bold uppercase px-1.5 py-0.5 rounded">
                      Primary
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      {m.mediaType === "image" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSetPrimary(m.id); }}
                          className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors"
                          title="Set as primary"
                        >
                          <svg className="w-3 h-3 text-[#E4002B]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(m.id); }}
                        className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview / Upload Panel */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-black/5 p-4">
          {previewMedia ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/50">Preview</p>
                <button type="button" onClick={() => setPreviewMedia(null)} className="text-black/30 hover:text-black/60 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="aspect-[4/3] bg-black/5 rounded-lg overflow-hidden mb-3">
                {previewMedia.mediaType === "image" ? (
                  <img src={mediaUrl(previewMedia.filePath)} alt="" className="w-full h-full object-contain" />
                ) : previewMedia.mediaType === "model" ? (
                  <ModelViewer modelUrl={mediaUrl(previewMedia.filePath)} backgroundColor="#f9fafb" autoRotate={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] uppercase text-black/30">{previewMedia.mediaType}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-black/40 uppercase font-bold">Type</span>
                  <span className="font-bold">{previewMedia.mediaType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/40 uppercase font-bold">Caption</span>
                  <span className="font-bold text-right max-w-[140px] truncate">{previewMedia.caption || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/40 uppercase font-bold">Order</span>
                  <span className="font-bold">{previewMedia.sortOrder}</span>
                </div>
                {previewMedia.mediaType === "image" && (
                  <div className="flex justify-between">
                    <span className="text-black/40 uppercase font-bold">Primary</span>
                    <span className="font-bold">{previewMedia.isPrimary ? "Yes" : "No"}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-1">
                <button
                  type="button"
                  onClick={() => handleReorder(previewMedia.id, "up")}
                  className="flex-1 px-2 py-1.5 text-[9px] font-bold uppercase bg-black/5 rounded-md hover:bg-black/10 transition-colors"
                >
                  ← Move Left
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(previewMedia.id, "down")}
                  className="flex-1 px-2 py-1.5 text-[9px] font-bold uppercase bg-black/5 rounded-md hover:bg-black/10 transition-colors"
                >
                  Move Right →
                </button>
              </div>
            </div>
          ) : pendingFiles.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-3">Pending Upload</p>
              <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
                {pendingFiles.map((f) => (
                  <div key={`${f.name}-${f.lastModified}`} className="flex items-center justify-between text-[10px] py-1.5 border-b border-black/5 last:border-0">
                    <span className="truncate pr-2 font-medium">{f.name}</span>
                    <span className="text-black/30 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-4">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full px-3 py-2 text-xs bg-black/5 rounded-lg border-0 outline-none focus:ring-2 focus:ring-[#E4002B]/30"
                />
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markFirstPrimary}
                    onChange={(e) => setMarkFirstPrimary(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-black/20 text-[#E4002B] focus:ring-[#E4002B]/30"
                  />
                  Mark first as primary
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPendingFiles([])}
                  className="flex-1 px-3 py-2 text-[10px] font-bold uppercase bg-black/5 rounded-lg hover:bg-black/10 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-3 py-2 text-[10px] font-bold uppercase bg-[#E4002B] text-white rounded-lg hover:bg-[#C40025] transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg className="w-8 h-8 mx-auto text-black/10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-[10px] text-black/30 uppercase">Click "Add Files" to upload</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[340px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-[#111] mb-2">Delete Media</h3>
            <p className="text-xs text-black/60 mb-5">This will permanently delete this media file. This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-black/5 hover:bg-black/10 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => handleDeleteMedia(deleteConfirm)} className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
