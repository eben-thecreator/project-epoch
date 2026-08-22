import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "../../lib/api";
import {
  adminFetch,
  clearAdminToken,
  isAdminAuthenticated,
} from "../../lib/adminAuth";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { StatsDashboard } from "./StatsDashboard";
import { AssetTable } from "./AssetTable";
import { AssetFormModal } from "./AssetFormModal";
import { MediaManager } from "./MediaManager";
import { AdminLogin } from "./AdminLogin";
import { ToastContainer } from "./Toast";
import type { AdminTab, HeritageAsset, Toast } from "./types";

export const MediaAdmin = (): JSX.Element => {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (authenticated) loadAssets();
  }, [authenticated, loadAssets]);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;

  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    setActiveTab("media");
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
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Bulk delete failed.");
    }
  };

  if (!authenticated) {
    return <AdminLogin onAuthenticated={() => setAuthenticated(true)} />;
  }

  const breadcrumb = activeTab === "dashboard" ? "Dashboard" : activeTab === "assets" ? "Assets" : "Media";

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <AdminHeader breadcrumb={breadcrumb} />

      <div className="flex pt-14 h-screen">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === "dashboard" && (
              <>
                <StatsDashboard />
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
              </>
            )}

            {activeTab === "assets" && (
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
            )}

            {activeTab === "media" && (
              <div className="space-y-6">
                {/* Quick asset selector */}
                <div className="bg-white rounded-xl border border-black/5 p-4">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black/50 shrink-0">Selected Asset</label>
                    <select
                      value={selectedAssetId || ""}
                      onChange={(e) => setSelectedAssetId(e.target.value || null)}
                      className="flex-1 text-xs bg-black/5 rounded-lg px-3 py-2 border-0 outline-none cursor-pointer"
                    >
                      <option value="">— Select an asset —</option>
                      {assets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name || a.alternative_name || a.id}
                        </option>
                      ))}
                    </select>
                    {selectedAsset && (
                      <button
                        type="button"
                        onClick={() => setEditingAsset(selectedAsset)}
                        className="text-[10px] font-bold uppercase px-3 py-2 bg-black/5 rounded-lg hover:bg-black/10 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <MediaManager asset={selectedAsset} onRefresh={loadAssets} onToast={addToast} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {(showCreateModal || editingAsset) && (
        <AssetFormModal
          asset={editingAsset}
          onClose={() => { setShowCreateModal(false); setEditingAsset(null); }}
          onSave={loadAssets}
          onToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
