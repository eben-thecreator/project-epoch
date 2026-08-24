import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { apiUrl, mediaUrl } from "../../lib/api";
import { adminFetch, getAdminToken, clearAdminToken } from "../../lib/adminAuth";
import { ModelViewer } from "../../components/ModelViewer";
import { ConfirmModal } from "./ConfirmModal";
import type { HeritageAsset, MediaItem } from "./types";

interface MediaManagerProps {
  asset: HeritageAsset;
  onRefresh: () => void;
  onToast: (type: "success" | "error", message: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILE_SIZE_MODEL = 500 * 1024 * 1024;
const MAX_FILES = 20;

const isModelFile = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "glb" || ext === "gltf";
};

const getMaxFileSize = (file: File) => (isModelFile(file) ? MAX_FILE_SIZE_MODEL : MAX_FILE_SIZE);

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export const MediaManager = ({ asset, onRefresh, onToast }: MediaManagerProps): JSX.Element => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [markFirstPrimary, setMarkFirstPrimary] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const ingestFiles = (incoming: File[]) => {
    if (!incoming.length) return;
    const oversized = incoming.filter((f) => f.size > getMaxFileSize(f));
    const candidates = incoming.filter((f) => f.size <= getMaxFileSize(f));
    const seen = new Set(pendingFiles.map((f) => `${f.name}:${f.size}`));
    const deduped = candidates.filter((f) => !seen.has(`${f.name}:${f.size}`));
    const room = Math.max(0, MAX_FILES - pendingFiles.length);
    const accepted = deduped.slice(0, room);
    setPendingFiles([...pendingFiles, ...accepted]);

    const notes: string[] = [];
    if (oversized.length > 0)
      notes.push(`${oversized.length} file${oversized.length > 1 ? "s" : ""} skipped — too large`);
    const duplicates = candidates.length - deduped.length;
    if (duplicates > 0) notes.push(`${duplicates} duplicate${duplicates > 1 ? "s" : ""} skipped`);
    const capped = deduped.length - accepted.length;
    if (capped > 0) notes.push(`${capped} skipped — ${MAX_FILES}-file limit`);
    if (notes.length > 0)
      onToast("error", `${notes.join("; ")}. Models up to 500 MB, other files up to 50 MB.`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    ingestFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const removePendingFile = (target: File) => {
    setPendingFiles((prev) => prev.filter((f) => f !== target));
  };

  const handleUpload = () => {
    if (!asset || pendingFiles.length === 0 || uploading) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    pendingFiles.forEach((f) => formData.append("files", f));
    formData.append("caption", caption);
    formData.append("markFirstAsPrimary", String(markFirstPrimary));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/upload`));
    const token = getAdminToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    const finish = (message: string, type: "success" | "error") => {
      setUploading(false);
      setUploadProgress(0);
      if (type === "success") {
        onToast("success", message);
        setPendingFiles([]);
        setCaption("");
        onRefresh();
      } else {
        onToast("error", message);
      }
    };

    xhr.onload = () => {
      let body: { error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = {};
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        finish(`Uploaded ${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}.`, "success");
      } else if (xhr.status === 401) {
        clearAdminToken();
        window.location.reload();
      } else {
        finish(body.error || "Upload failed.", "error");
      }
    };
    xhr.onerror = () => finish("Network error during upload.", "error");
    xhr.send(formData);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const res = await adminFetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/${mediaId}`), {
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
    try {
      const res = await adminFetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/${mediaId}`), {
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

  const handleReorder = async (mediaId: string, direction: "earlier" | "later") => {
    const media = asset.media || [];
    const idx = media.findIndex((m) => m.id === mediaId);
    if (idx === -1) return;
    const targetIdx = direction === "earlier" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= media.length) return;

    try {
      const res = await adminFetch(
        apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}/media/reorder`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: [
              { id: media[idx].id, sortOrder: targetIdx },
              { id: media[targetIdx].id, sortOrder: idx },
            ],
          }),
        }
      );
      if (!res.ok) throw new Error();
      onRefresh();
    } catch {
      onToast("error", "Failed to reorder.");
    }
  };

  const openPreview = (m: MediaItem) => setPreviewMedia(m);

  const previewIdx = previewMedia ? (asset.media || []).findIndex((m) => m.id === previewMedia.id) : -1;

  return (
    <div
      className="relative bg-white border border-hairline"
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragOver(false);
        ingestFiles(Array.from(e.dataTransfer.files || []));
      }}
    >
      {dragOver && (
        <div className="absolute inset-0 z-20 bg-white/90 border border-dashed border-ink flex items-center justify-center pointer-events-none">
          <p className="text-[13px] font-medium text-ink">Drop files to stage for upload</p>
        </div>
      )}

      <div className="p-4 border-b border-hairline flex items-center justify-between gap-4">
        <div>
          <h3 className="f-heading-5 text-ink">Media Manager</h3>
          <p className="text-[12px] tabular-nums text-ink-soft mt-0.5">
            {(asset.media || []).length} file{(asset.media || []).length !== 1 ? "s" : ""}
          </p>
        </div>
        <label className="cursor-pointer f-caption px-3 py-2 border border-ink/15 hover:border-ink transition-colors duration-200 ease-house flex items-center gap-2 shrink-0">
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.glb,.gltf,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            ref={fileInputRef}
          />
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={1.5} d="M12 5v14M5 12h14" />
          </svg>
          Add Files
        </label>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          {(asset.media || []).length === 0 && pendingFiles.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="w-9 h-9 mx-auto text-ink/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="f-caption text-ink">No media files yet</p>
              <p className="mt-1.5 text-[13px] text-ink-soft">Add files or drop them anywhere on this panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2">
              {(asset.media || []).map((m) => (
                <div
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openPreview(m)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPreview(m);
                    }
                  }}
                  title={m.fileName || m.caption || m.mediaType}
                  className={cn(
                    "relative aspect-square overflow-hidden cursor-pointer group border transition-colors duration-200 ease-house outline-none",
                    previewMedia?.id === m.id
                      ? "border-brand"
                      : "border-transparent [@media(hover:hover)]:hover:border-ink/25 focus-visible:border-ink"
                  )}
                >
                  <div className="absolute inset-0 bg-paper-deep flex items-center justify-center">
                    {m.mediaType === "image" ? (
                      <img
                        src={mediaUrl(m.filePath)}
                        alt={m.caption || ""}
                        loading="lazy"
                        className="relative w-full h-full object-cover"
                      />
                    ) : m.mediaType === "video" ? (
                      <svg className="w-6 h-6 text-ink/30 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                      </svg>
                    ) : m.mediaType === "audio" ? (
                      <span className="text-[12px] text-ink/40">Audio</span>
                    ) : m.mediaType === "model" ? (
                      <span className="text-[12px] text-ink/40">3D</span>
                    ) : (
                      <svg className="w-6 h-6 text-ink/30 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </div>

                  {m.isPrimary && m.mediaType === "image" && (
                    <div className="absolute top-1.5 left-1.5 bg-white/95 pl-1 pr-1.5 py-0.5 flex items-center gap-1">
                      <span aria-hidden="true" className="block w-1.5 h-1.5 rounded-full bg-brand" />
                      <span className="text-[10px] leading-none text-ink">Primary</span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "absolute inset-0 bg-ink/45 flex items-center justify-center transition-opacity duration-200 ease-house",
                      previewMedia?.id === m.id
                        ? "opacity-100"
                        : "opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                    )}
                  >
                    <div className="flex gap-1">
                      {m.mediaType === "image" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimary(m.id);
                          }}
                          disabled={m.isPrimary}
                          className="p-1.5 bg-white hover:bg-paper-deep transition-colors duration-200 ease-house disabled:opacity-40 disabled:cursor-not-allowed"
                          title={m.isPrimary ? "Current primary" : "Set as primary"}
                        >
                          <svg className="w-3 h-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(m.id);
                        }}
                        className="p-1.5 bg-white hover:bg-paper-deep transition-colors duration-200 ease-house"
                        title="Delete"
                      >
                        <svg className="w-3 h-3 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-hairline p-4">
          {previewMedia ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-medium text-ink">Preview</p>
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  aria-label="Close preview"
                  className="text-ink/35 hover:text-ink transition-colors duration-200 ease-house"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="aspect-[4/3] bg-paper-deep overflow-hidden mb-4 flex items-center justify-center">
                {previewMedia.mediaType === "image" ? (
                  <img src={mediaUrl(previewMedia.filePath)} alt="" className="w-full h-full object-contain" />
                ) : previewMedia.mediaType === "model" ? (
                  <ModelViewer modelUrl={mediaUrl(previewMedia.filePath)} backgroundColor="#F5F5F5" autoRotate={false} />
                ) : previewMedia.mediaType === "video" ? (
                  <video src={mediaUrl(previewMedia.filePath)} controls className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[13px] text-ink/40">{previewMedia.mediaType}</span>
                )}
              </div>

              <dl>
                {[
                  { label: "Type", value: previewMedia.mediaType },
                  ...(previewMedia.fileName ? [{ label: "File", value: previewMedia.fileName }] : []),
                  { label: "Caption", value: previewMedia.caption || "—" },
                  { label: "Order", value: String(previewMedia.sortOrder) },
                  ...(previewMedia.mediaType === "image"
                    ? [{ label: "Primary", value: previewMedia.isPrimary ? "Yes" : "No" }]
                    : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 py-2 border-b border-ink/10 last:border-0">
                    <dt className="shrink-0 text-[12px] text-ink-soft">{row.label}</dt>
                    <dd className="text-right text-[13px] leading-snug min-w-0 break-words text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleReorder(previewMedia.id, "earlier")}
                  disabled={previewIdx <= 0}
                  className="px-2 py-1.5 text-[12px] border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-ink/15"
                >
                  ← Earlier
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(previewMedia.id, "later")}
                  disabled={previewIdx === -1 || previewIdx >= (asset.media || []).length - 1}
                  className="px-2 py-1.5 text-[12px] border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-ink/15"
                >
                  Later →
                </button>
                {previewMedia.mediaType === "image" && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(previewMedia.id)}
                    disabled={previewMedia.isPrimary}
                    className="px-2 py-1.5 text-[12px] border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-ink/15"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(previewMedia.id)}
                  className="px-2 py-1.5 text-[12px] border border-brand/40 hover:border-brand text-brand transition-colors duration-200 ease-house"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : pendingFiles.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-medium text-ink">Staged</p>
                <p className="text-[12px] tabular-nums text-ink-soft">
                  {pendingFiles.length}/{MAX_FILES}
                </p>
              </div>
              <div className="mb-4 max-h-48 overflow-y-auto">
                {pendingFiles.map((f) => (
                  <div
                    key={`${f.name}-${f.lastModified}`}
                    className="group flex items-center gap-2 py-1.5 border-b border-ink/10 last:border-0"
                  >
                    <span className="text-[13px] text-ink truncate min-w-0 flex-1" title={f.name}>
                      {f.name}
                    </span>
                    <span className="text-[12px] tabular-nums text-ink-soft shrink-0">{formatBytes(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => removePendingFile(f)}
                      disabled={uploading}
                      aria-label={`Remove ${f.name}`}
                      className="shrink-0 p-0.5 text-ink/30 hover:text-brand transition-colors duration-200 ease-house disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-4">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  aria-label="Caption for staged files"
                  className="w-full px-3 py-2 f-caption bg-transparent border border-ink/15 rounded-none outline-none focus:border-ink transition-colors duration-200 placeholder:text-ink/40 text-ink"
                />
                <label className="flex items-center gap-2.5 f-caption text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={markFirstPrimary}
                    onChange={(e) => setMarkFirstPrimary(e.target.checked)}
                    className="w-3.5 h-3.5 accent-brand"
                  />
                  Mark first image as primary
                </label>
              </div>

              {uploading && (
                <div className="mb-3">
                  <div className="flex justify-between text-[12px] tabular-nums text-ink-soft mb-1.5">
                    <span>Uploading…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-[3px] w-full bg-paper-deep overflow-hidden">
                    <div
                      className="h-full bg-brand transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPendingFiles([])}
                  disabled={uploading}
                  className="flex-1 px-3 py-2 f-caption border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-3 py-2 f-caption bg-ink text-white hover:bg-ink/80 transition-colors duration-200 ease-house disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {uploading ? `${uploadProgress}%` : `Upload ${pendingFiles.length}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg className="w-7 h-7 mx-auto text-ink/15 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <p className="f-caption text-ink-soft">Click “Add Files” or drop files here</p>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <ConfirmModal
          title="Delete media"
          body="This will permanently delete this media file. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => handleDeleteMedia(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};
