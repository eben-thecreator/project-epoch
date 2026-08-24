import { useEffect, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { mediaUrl } from "../../lib/api";
import { ConfirmModal } from "./ConfirmModal";
import type { HeritageAsset } from "./types";

interface AssetTableProps {
  assets: HeritageAsset[];
  loading: boolean;
  selectedAssetId: string | null;
  mode?: "active" | "trash";
  onSelectAsset: (id: string) => void;
  onEditAsset: (asset: HeritageAsset) => void;
  onDeleteAsset: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onCreateAsset: () => void;
  onRestoreAsset?: (id: string) => void;
  onPermanentDeleteAsset?: (id: string) => void;
}

type SortField = "name" | "asset_type" | "asset_category" | "region" | "created_at";
type SortDir = "asc" | "desc";

const TrashGlyph = ({ className }: { className?: string }): JSX.Element => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export const AssetTable = ({
  assets,
  loading,
  selectedAssetId,
  mode = "active",
  onSelectAsset,
  onEditAsset,
  onDeleteAsset,
  onBulkDelete,
  onCreateAsset,
  onRestoreAsset,
  onPermanentDeleteAsset,
}: AssetTableProps): JSX.Element => {
  const isTrash = mode === "trash";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState<string | null>(null);

  const sortValue = (asset: HeritageAsset, field: SortField): string => {
    if (field === "created_at") {
      return String((isTrash ? asset.deleted_at ?? asset.created_at : asset.created_at) ?? "");
    }
    return String(asset[field] ?? "");
  };

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
        const cmp = sortValue(a, sortField).localeCompare(sortValue(b, sortField));
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [assets, search, typeFilter, categoryFilter, sortField, sortDir, isTrash]);

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const live = new Set(assets.map((a) => a.id));
      const next = new Set([...prev].filter((id) => live.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [assets]);

  const visibleSelected = useMemo(
    () => filtered.filter((a) => selectedIds.has(a.id)),
    [filtered, selectedIds]
  );

  const allChecked = filtered.length > 0 && visibleSelected.length === filtered.length;
  const hasQuery = Boolean(search.trim()) || typeFilter !== "All" || categoryFilter !== "All";

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
    setSelectedIds((prev) => {
      if (filtered.length > 0 && visibleSelected.length === filtered.length) {
        const next = new Set(prev);
        filtered.forEach((a) => next.delete(a.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setCategoryFilter("All");
  };

  const columns: { field: SortField; label: string }[] = [
    { field: "name", label: "Name" },
    { field: "asset_type", label: "Type" },
    { field: "asset_category", label: "Category" },
    { field: "region", label: "Region" },
    { field: "created_at", label: isTrash ? "Deleted" : "Created" },
  ];

  const filterSelectClass =
    "w-full appearance-none f-caption bg-transparent pl-3 pr-8 py-2 rounded-none outline-none focus:border-ink transition-colors duration-200 cursor-pointer text-ink";

  const FilterSelect = ({
    value,
    onChange,
    options,
    label,
  }: {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    label: string;
  }) => (
    <div className="relative w-full sm:w-auto">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={filterSelectClass} aria-label={label}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "All" ? `All ${label}s` : o}
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
  );

  const colCount = isTrash ? 6 : 7;

  return (
    <div className="bg-white border border-hairline">
      <div className="p-4 border-b border-hairline flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/35 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="6.5" strokeWidth={1.25} />
              <path strokeLinecap="round" d="M16 16l4.5 4.5" strokeWidth={1.25} />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets…"
              className="w-full pl-9 pr-8 py-2 f-caption bg-transparent border border-ink/15 rounded-none outline-none focus:border-ink transition-colors duration-200 placeholder:text-ink/40 text-ink"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink/35 hover:text-ink transition-colors duration-200 ease-house"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="hidden sm:block w-36">
            <FilterSelect value={typeFilter} onChange={setTypeFilter} options={typeOptions} label="Type" />
          </div>
          <div className="hidden md:block w-40">
            <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} label="Category" />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isTrash ? (
            <p className="text-[12px] text-ink-soft">Soft-deleted assets — restore or remove permanently</p>
          ) : (
            <>
              {visibleSelected.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="f-caption px-3 py-2 border border-brand/40 text-brand hover:border-brand hover:bg-brand/5 transition-colors duration-200 ease-house disabled:cursor-not-allowed"
                >
                  Delete ({visibleSelected.length})
                </button>
              )}
              <button
                type="button"
                onClick={onCreateAsset}
                className="f-caption px-4 py-2 bg-ink text-white hover:bg-ink/80 transition-colors duration-200 ease-house flex items-center gap-2 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth={1.5} d="M12 5v14M5 12h14" />
                </svg>
                New Asset
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-hairline">
              {!isTrash && (
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    ref={(el) => {
                      if (el) el.indeterminate = visibleSelected.length > 0 && !allChecked;
                    }}
                    checked={allChecked}
                    onChange={toggleSelectAll}
                    aria-label="Select all visible assets"
                    className="w-3.5 h-3.5 accent-brand cursor-pointer align-middle"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isActive = sortField === col.field;
                return (
                  <th
                    key={col.field}
                    scope="col"
                    aria-sort={isActive ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                    className="px-4 py-3 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.field)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[12px] leading-none select-none transition-colors duration-200 ease-house",
                        isActive ? "text-ink font-medium" : "text-ink-soft hover:text-ink font-normal"
                      )}
                    >
                      {col.label}
                      <svg
                        aria-hidden="true"
                        className={cn(
                          "w-2.5 h-2.5 transition-transform duration-200 ease-house",
                          isActive ? (sortDir === "asc" ? "rotate-180 text-ink" : "text-ink") : "text-ink/25"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </th>
                );
              })}
              <th scope="col" className="w-24 px-4 py-3 text-right">
                <span className="text-[12px] leading-none font-normal text-ink-soft">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-hairline last:border-0">
                  {!isTrash && (
                    <td className="px-4 py-3">
                      <div className="w-3.5 h-3.5 bg-paper-deep" />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-paper-deep shrink-0" />
                      <div className="h-3 w-36 bg-paper-deep" />
                    </div>
                  </td>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 w-20 bg-paper-deep" />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="h-3 w-14 bg-paper-deep ml-auto" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-20 text-center">
                  <div className="max-w-xs mx-auto">
                    <TrashGlyph className="w-8 h-8 mx-auto text-ink/15 mb-4" />
                    <p className="f-body-2 text-ink">
                      {hasQuery ? "No matching assets" : isTrash ? "Trash is empty" : "No assets yet"}
                    </p>
                    <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">
                      {hasQuery
                        ? "Nothing in the current collection matches your filters."
                        : isTrash
                          ? "Deleted assets will rest here until they are restored or permanently removed."
                          : "Create your first heritage asset to begin building the catalogue."}
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-2">
                      {hasQuery && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="f-caption px-4 py-2 border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house"
                        >
                          Clear filters
                        </button>
                      )}
                      {!isTrash && !hasQuery && (
                        <button
                          type="button"
                          onClick={onCreateAsset}
                          className="f-caption px-4 py-2 bg-ink text-white hover:bg-ink/80 transition-colors duration-200 ease-house"
                        >
                          New Asset
                        </button>
                      )}
                    </div>
                  </div>
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
                    onClick={() => {
                      if (!isTrash) onSelectAsset(asset.id);
                    }}
                    title={!isTrash ? "Open in Media" : undefined}
                    className={cn(
                      "group border-b border-hairline last:border-0 transition-colors duration-200 ease-house",
                      !isTrash && "cursor-pointer",
                      isSelected ? "bg-paper-deep" : "[@media(hover:hover)]:hover:bg-paper-deep/60"
                    )}
                  >
                    {!isTrash && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(asset.id)}
                          aria-label={`Select ${asset.name || asset.id}`}
                          className="w-3.5 h-3.5 accent-brand cursor-pointer align-middle"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "block w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200 ease-house",
                            isSelected ? "bg-brand" : "bg-transparent"
                          )}
                        />
                        <div className="w-8 h-8 bg-paper-deep overflow-hidden shrink-0 flex items-center justify-center">
                          {imageMedia ? (
                            <img
                              src={mediaUrl(imageMedia.filePath)}
                              alt=""
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <TrashGlyph className="w-3.5 h-3.5 text-ink/25" />
                          )}
                        </div>
                        <span className="f-body-2 font-medium text-ink truncate max-w-[220px] group-hover:underline decoration-ink/30 underline-offset-4">
                          {asset.name || asset.alternative_name || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-ink-soft">{asset.asset_type || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-ink-soft">{asset.asset_category || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-ink-soft">{asset.region || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] tabular-nums text-ink-soft">
                        {new Date(sortValue(asset, "created_at")).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {isTrash ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onRestoreAsset?.(asset.id)}
                              className="p-1.5 text-ink/35 hover:text-ink transition-colors duration-200 ease-house"
                              title="Restore"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPurgeConfirm(asset.id)}
                              className="p-1.5 text-ink/35 hover:text-brand transition-colors duration-200 ease-house"
                              title="Delete permanently"
                            >
                              <TrashGlyph className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onEditAsset(asset)}
                              className="p-1.5 text-ink/35 hover:text-ink transition-colors duration-200 ease-house"
                              title="Edit"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(asset.id)}
                              className="p-1.5 text-ink/35 hover:text-brand transition-colors duration-200 ease-house"
                              title="Delete"
                            >
                              <TrashGlyph className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-hairline flex items-center justify-between gap-4">
        <p className="text-[12px] tabular-nums text-ink-soft">
          Showing {filtered.length.toLocaleString()} of {assets.length.toLocaleString()} assets
        </p>
        {visibleSelected.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[12px] tabular-nums text-brand">{visibleSelected.length} selected</span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-[12px] text-ink-soft underline underline-offset-2 hover:text-ink transition-colors duration-200 ease-house"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete asset"
          body="This will move the asset to Trash, hiding it from the site and admin lists. You can restore it from the Trash section."
          confirmLabel="Delete"
          onConfirm={() => {
            onDeleteAsset(showDeleteConfirm);
            setShowDeleteConfirm(null);
          }}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {showBulkDeleteConfirm && (
        <ConfirmModal
          title={`Delete ${visibleSelected.length} assets`}
          body={`This will move ${visibleSelected.length} assets to Trash, hiding them from the site and admin lists. You can restore them from the Trash section.`}
          confirmLabel="Delete all"
          onConfirm={() => {
            onBulkDelete(visibleSelected.map((a) => a.id));
            setSelectedIds(new Set());
            setShowBulkDeleteConfirm(false);
          }}
          onCancel={() => setShowBulkDeleteConfirm(false)}
        />
      )}

      {showPurgeConfirm && (
        <ConfirmModal
          title="Delete permanently"
          body="This will permanently delete the asset and all its media files. This action cannot be undone."
          confirmLabel="Delete forever"
          onConfirm={() => {
            onPermanentDeleteAsset?.(showPurgeConfirm);
            setShowPurgeConfirm(null);
          }}
          onCancel={() => setShowPurgeConfirm(null)}
        />
      )}
    </div>
  );
};
