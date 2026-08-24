import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl, mediaUrl } from "../../lib/api";
import {
  adminFetch,
  clearAdminToken,
  isAdminAuthenticated,
} from "../../lib/adminAuth";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar, AdminTabBar } from "./AdminSidebar";
import { StatsDashboard } from "./StatsDashboard";
import { AssetTable } from "./AssetTable";
import { AssetFormModal } from "./AssetFormModal";
import { MediaManager } from "./MediaManager";
import { AdminLogin } from "./AdminLogin";
import { ToastContainer } from "./Toast";
import type { AdminTab, HeritageAsset, Toast } from "./types";

const PageHead = ({ title, meta }: { title: string; meta?: string }): JSX.Element => (
  <div className="flex items-end justify-between mb-5 gap-4">
    <h2 className="f-heading-4 text-ink">{title}</h2>
    {meta && <p className="text-[13px] text-ink-soft tabular-nums shrink-0">{meta}</p>}
  </div>
);

export const MediaAdmin = (): JSX.Element => {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [trashAssets, setTrashAssets] = useState<HeritageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrash, setLoadingTrash] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<HeritageAsset | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const loadedRef = useRef(false);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadAssets = useCallback(async () => {
    try {
      if (!loadedRef.current) setLoading(true);
      const res = await adminFetch(apiUrl("/api/heritage-assets"));
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load assets.");
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
      loadedRef.current = true;
    } catch {
      addToast("error", "Failed to load heritage assets.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const loadTrashAssets = useCallback(async () => {
    try {
      setLoadingTrash(true);
      const res = await adminFetch(apiUrl("/api/heritage-assets?deleted=true"));
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load trash.");
      const data = await res.json();
      setTrashAssets(Array.isArray(data) ? data : []);
    } catch {
      addToast("error", "Failed to load deleted assets.");
    } finally {
      setLoadingTrash(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (authenticated) {
      loadAssets();
      loadTrashAssets();
    }
  }, [authenticated, loadAssets, loadTrashAssets]);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;

  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    setActiveTab("media");
  };

  const handleSignOut = () => {
    clearAdminToken();
    setAssets([]);
    setTrashAssets([]);
    setSelectedAssetId(null);
    setEditingAsset(null);
    setShowCreateModal(false);
    loadedRef.current = false;
    setActiveTab("dashboard");
    setAuthenticated(false);
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const res = await adminFetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(id)}`), { method: "DELETE" });
      if (res.status === 401) {
        clearAdminToken();
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Delete failed.");
      addToast("success", "Asset deleted.");
      if (selectedAssetId === id) setSelectedAssetId(null);
      loadAssets();
      loadTrashAssets();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const res = await adminFetch(apiUrl("/api/heritage-assets/bulk-delete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.status === 401) {
        clearAdminToken();
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Bulk delete failed.");
      const data = await res.json();
      addToast("success", `${data.deleted} asset${data.deleted > 1 ? "s" : ""} deleted.`);
      if (ids.includes(selectedAssetId || "")) setSelectedAssetId(null);
      loadAssets();
      loadTrashAssets();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Bulk delete failed.");
    }
  };

  const handleRestoreAsset = async (id: string) => {
    try {
      const res = await adminFetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(id)}/restore`), {
        method: "POST",
      });
      if (res.status === 401) {
        clearAdminToken();
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Restore failed.");
      addToast("success", "Asset restored.");
      loadAssets();
      loadTrashAssets();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Restore failed.");
    }
  };

  const handlePermanentDeleteAsset = async (id: string) => {
    try {
      const res = await adminFetch(apiUrl(`/api/heritage-assets/${encodeURIComponent(id)}/permanent`), {
        method: "DELETE",
      });
      if (res.status === 401) {
        clearAdminToken();
        setAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error("Permanent delete failed.");
      addToast("success", "Asset permanently deleted.");
      if (selectedAssetId === id) setSelectedAssetId(null);
      loadTrashAssets();
      loadAssets();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Permanent delete failed.");
    }
  };

  if (!authenticated) {
    return <AdminLogin onAuthenticated={() => setAuthenticated(true)} />;
  }

  const breadcrumb =
    activeTab === "dashboard"
      ? "Dashboard"
      : activeTab === "assets"
        ? "Assets"
        : activeTab === "trash"
          ? "Trash"
          : "Media";

  const counts = { assets: assets.length, trash: trashAssets.length };
  const showLibrary = activeTab === "dashboard" || activeTab === "assets";

  const selectedImageMedia = selectedAsset?.media?.find((m) => m.mediaType === "image");

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader breadcrumb={breadcrumb} onSignOut={handleSignOut} />

      <div className="flex pt-14 h-screen">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

        <main className="flex-1 overflow-y-auto min-w-0">
          <AdminTabBar activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px]">
            {showLibrary ? (
              <div>
                {activeTab === "dashboard" && <StatsDashboard />}
                {activeTab === "assets" && (
                  <PageHead title="Assets" meta={`${assets.length.toLocaleString()} records`} />
                )}
                <AssetTable
                  assets={assets}
                  loading={loading}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={handleSelectAsset}
                  onEditAsset={(a) => setEditingAsset(a)}
                  onDeleteAsset={handleDeleteAsset}
                  onBulkDelete={handleBulkDelete}
                  onCreateAsset={() => setShowCreateModal(true)}
                />
              </div>
            ) : activeTab === "trash" ? (
              <div>
                <PageHead title="Trash" meta={`${trashAssets.length.toLocaleString()} deleted`} />
                <AssetTable
                  mode="trash"
                  assets={trashAssets}
                  loading={loadingTrash}
                  selectedAssetId={null}
                  onSelectAsset={() => {}}
                  onEditAsset={() => {}}
                  onDeleteAsset={() => {}}
                  onBulkDelete={() => {}}
                  onCreateAsset={() => {}}
                  onRestoreAsset={handleRestoreAsset}
                  onPermanentDeleteAsset={handlePermanentDeleteAsset}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {selectedAsset ? (
                  <div className="bg-white border border-hairline p-4 sm:p-5 flex flex-wrap items-center gap-4">
                    <div className="w-11 h-11 bg-paper-deep overflow-hidden shrink-0 flex items-center justify-center">
                      {selectedImageMedia ? (
                        <img
                          src={mediaUrl(selectedImageMedia.filePath)}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-4 h-4 text-ink/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.25}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 basis-48">
                      <p className="f-body-2 font-medium text-ink truncate">
                        {selectedAsset.name || selectedAsset.alternative_name || "Untitled"}
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-soft truncate">
                        {[selectedAsset.asset_type, selectedAsset.asset_category, selectedAsset.region]
                          .filter(Boolean)
                          .join(" · ") || selectedAsset.id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="relative w-full sm:w-56 shrink-0">
                      <label htmlFor="media-asset-select" className="sr-only">
                        Switch asset
                      </label>
                      <select
                        id="media-asset-select"
                        value={selectedAssetId || ""}
                        onChange={(e) => setSelectedAssetId(e.target.value || null)}
                        className="w-full appearance-none f-caption bg-transparent border border-ink/15 pl-3 pr-8 py-2 rounded-none outline-none focus:border-ink transition-colors duration-200 cursor-pointer text-ink"
                      >
                        <option value="">Switch asset…</option>
                        {assets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name || a.alternative_name || a.id}
                          </option>
                        ))}
                      </select>
                      <svg
                        aria-hidden="true"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-ink/40 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingAsset(selectedAsset)}
                      className="f-caption px-3 py-2 border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house flex items-center gap-2 shrink-0"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-hairline py-16 px-6 text-center">
                    <svg className="w-9 h-9 mx-auto text-ink/15 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="f-body-2 font-medium text-ink">No asset selected</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft max-w-sm mx-auto">
                      Pick an asset from the table, or choose one here to manage its media library.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("assets")}
                      className="mt-5 f-caption px-4 py-2 bg-ink text-white hover:bg-ink/80 transition-colors duration-200 ease-house"
                    >
                      Browse assets
                    </button>
                  </div>
                )}

                {selectedAsset && (
                  <MediaManager asset={selectedAsset} onRefresh={loadAssets} onToast={addToast} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {(showCreateModal || editingAsset) && (
        <AssetFormModal
          asset={editingAsset}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAsset(null);
          }}
          onSave={loadAssets}
          onToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
