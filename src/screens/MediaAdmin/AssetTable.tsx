import { useMemo, useState } from "react";
import { mediaUrl } from "../../lib/api";
import type { HeritageAsset } from "./types";

interface AssetTableProps {
  assets: HeritageAsset[];
  loading: boolean;
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
  onEditAsset: (asset: HeritageAsset) => void;
  onDeleteAsset: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onCreateAsset: () => void;
}

type SortField = "name" | "asset_type" | "asset_category" | "region" | "created_at";
type SortDir = "asc" | "desc";

export const AssetTable = ({
  assets,
  loading,
  selectedAssetId,
  onSelectAsset,
  onEditAsset,
  onDeleteAsset,
  onBulkDelete,
  onCreateAsset,
}: AssetTableProps): JSX.Element => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const typeOptions = useMemo(
    () => ["All", ...Array.from(new Set(assets.map((a) => a.asset_type).filter(Boolean) as string[]))],
    [assets]
  );

  const categoryOptions = useMemo(
    () => ["All", ...Array.from(new Set(assets.map((a) => a.asset_category).filter(Boolean) as string[]))],
    [assets]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets
      .filter((a) => {
        const matchesSearch =
          !q ||
          [a.name, a.alternative_name, a.region, a.district, a.community, a.asset_category, a.asset_type, a.material]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q));
        const matchesType = typeFilter === "All" || a.asset_type === typeFilter;
        const matchesCat = categoryFilter === "All" || a.asset_category === categoryFilter;
        return matchesSearch && matchesType && matchesCat;
      })
      .sort((a, b) => {
        const av = (a[sortField] ?? "") as string;
        const bv = (b[sortField] ?? "") as string;
        const cmp = av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [assets, search, typeFilter, categoryFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <svg className={`w-3 h-3 inline-block ml-1 ${sortField === field ? "text-[#E4002B]" : "text-black/20"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === field && sortDir === "desc" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
    </svg>
  );

  return (
    <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-black/5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-black/5 rounded-lg border-0 outline-none focus:ring-2 focus:ring-[#E4002B]/30 transition-all"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-[11px] font-bold uppercase bg-black/5 rounded-lg px-3 py-2 border-0 outline-none cursor-pointer"
            >
              {typeOptions.map((o) => (
                <option key={o} value={o}>{o === "All" ? "All Types" : o}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-[11px] font-bold uppercase bg-black/5 rounded-lg px-3 py-2 border-0 outline-none cursor-pointer"
            >
              {categoryOptions.map((o) => (
                <option key={o} value={o}>{o === "All" ? "All Categories" : o}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="text-[10px] font-bold uppercase px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete ({selectedIds.size})
              </button>
            )}
            <button
              type="button"
              onClick={onCreateAsset}
              className="text-[10px] font-bold uppercase px-4 py-2 bg-[#E4002B] text-white rounded-lg hover:bg-[#C40025] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Asset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-black/20 text-[#E4002B] focus:ring-[#E4002B]/30 cursor-pointer"
                />
              </th>
              {[
                { field: "name" as SortField, label: "Name" },
                { field: "asset_type" as SortField, label: "Type" },
                { field: "asset_category" as SortField, label: "Category" },
                { field: "region" as SortField, label: "Region" },
                { field: "created_at" as SortField, label: "Created" },
              ].map((col) => (
                <th
                  key={col.field}
                  onClick={() => toggleSort(col.field)}
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-black/40 cursor-pointer hover:text-black/70 transition-colors select-none"
                >
                  {col.label}
                  <SortIcon field={col.field} />
                </th>
              ))}
              <th className="w-20 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-black/40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-black/5">
                  <td className="px-4 py-3"><div className="w-3.5 h-3.5 bg-black/5 rounded" /></td>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-black/5 rounded w-3/4" /></td>
                  ))}
                  <td className="px-4 py-3"><div className="h-3 bg-black/5 rounded w-1/2 ml-auto" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <p className="text-xs text-black/40 uppercase">No assets found</p>
                </td>
              </tr>
            ) : (
              filtered.map((asset) => {
                const isSelected = asset.id === selectedAssetId;
                const isChecked = selectedIds.has(asset.id);
                const imageMedia = asset.media?.find((m) => m.mediaType === "image");
                return (
                  <tr
                    key={asset.id}
                    onClick={() => onSelectAsset(asset.id)}
                    className={`border-b border-black/5 cursor-pointer transition-colors ${
                      isSelected ? "bg-[#E4002B]/5" : "hover:bg-black/[0.02]"
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(asset.id)}
                        className="w-3.5 h-3.5 rounded border-black/20 text-[#E4002B] focus:ring-[#E4002B]/30 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/5 overflow-hidden flex-shrink-0">
                          {imageMedia ? (
                            <img src={mediaUrl(imageMedia.filePath)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-[#111] truncate max-w-[200px]">
                          {asset.name || asset.alternative_name || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase text-black/50">{asset.asset_type || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase text-black/50">{asset.asset_category || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold uppercase text-black/50">{asset.region || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-black/40">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditAsset(asset)}
                          className="p-1.5 rounded-md hover:bg-black/5 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(asset.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5 text-black/40 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-black/5 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase text-black/40">
          {filtered.length} of {assets.length} assets
        </p>
        {selectedIds.size > 0 && (
          <p className="text-[10px] font-bold uppercase text-[#E4002B]">
            {selectedIds.size} selected
          </p>
        )}
      </div>

      {/* Single Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[360px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-[#111] mb-2">Delete Asset</h3>
            <p className="text-xs text-black/60 mb-5">This will permanently delete the asset and all its media files. This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAsset(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[360px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-[#111] mb-2">Delete {selectedIds.size} Assets</h3>
            <p className="text-xs text-black/60 mb-5">This will permanently delete {selectedIds.size} assets and all their media files. This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onBulkDelete(Array.from(selectedIds));
                  setSelectedIds(new Set());
                  setShowBulkDeleteConfirm(false);
                }}
                className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
