import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useFocusTrap } from "../../lib/useFocusTrap";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiUrl } from "../../lib/api";
import { adminFetch } from "../../lib/adminAuth";
import { ConfirmModal } from "./ConfirmModal";
import type { HeritageAsset } from "./types";

interface AssetFormModalProps {
  asset: HeritageAsset | null;
  onClose: () => void;
  onSave: () => void;
  onToast: (type: "success" | "error", message: string) => void;
}

const defaultForm = {
  name: "",
  alternative_name: "",
  description: "",
  asset_type: "",
  asset_category: "",
  cultural_group: "",
  region: "",
  district: "",
  community: "",
  current_location: "",
  origin_location: "",
  material: "",
  secondary_material: "",
  technique: "",
  condition: "",
  conservation_status: "",
  period: "",
  period_start: "",
  period_end: "",
  notes: "",
  data_source: "",
  ownership: "",
};

const GHANA_CENTER: L.LatLngTuple = [7.9465, -1.0232];

const getInitialPoint = (asset: HeritageAsset | null): L.LatLngTuple | null => {
  if (!asset?.geometry) return null;
  const g = asset.geometry;
  if (g.type !== "Point") return null;
  const c = g.coordinates;
  if (Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number") {
    return [c[1], c[0]];
  }
  return null;
};

const createIcon = () =>
  L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#E4002B;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 16],
  });

const SectionHead = ({ title, aside }: { title: string; aside?: string }): JSX.Element => (
  <div className="flex items-center gap-3 mb-5">
    <p className="text-[13px] font-medium text-ink shrink-0">{title}</p>
    <span aria-hidden="true" className="flex-1 h-px bg-hairline" />
    {aside && <p className="text-[12px] text-ink/40 shrink-0">{aside}</p>}
  </div>
);

export const AssetFormModal = ({ asset, onClose, onSave, onToast }: AssetFormModalProps): JSX.Element => {
  const [form, setForm] = useState({ ...defaultForm });
  const [baseline, setBaseline] = useState(() => JSON.stringify(defaultForm));
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const isEditing = !!asset;

  const initialPoint = getInitialPoint(asset);
  const initialGeometryRef = useRef(asset?.geometry ?? null);
  const [point, setPoint] = useState<L.LatLngTuple | null>(initialPoint);
  const [geometryDirty, setGeometryDirty] = useState(false);
  const [latInput, setLatInput] = useState(initialPoint ? String(initialPoint[0]) : "");
  const [lngInput, setLngInput] = useState(initialPoint ? String(initialPoint[1]) : "");

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const dirty = geometryDirty || JSON.stringify(form) !== baseline;

  const requestClose = useCallback(() => {
    if (dirty) setShowDiscard(true);
    else onClose();
  }, [dirty, onClose]);

  useFocusTrap(modalRef, true, requestClose);

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    let next = { ...defaultForm };
    if (asset) {
      next = {
        name: asset.name ?? "",
        alternative_name: asset.alternative_name ?? "",
        description: asset.description ?? "",
        asset_type: asset.asset_type ?? "",
        asset_category: asset.asset_category ?? "",
        cultural_group: asset.cultural_group ?? "",
        region: asset.region ?? "",
        district: asset.district ?? "",
        community: asset.community ?? "",
        current_location: asset.current_location ?? "",
        origin_location: asset.origin_location ?? "",
        material: asset.material ?? "",
        secondary_material: asset.secondary_material ?? "",
        technique: asset.technique ?? "",
        condition: asset.condition ?? "",
        conservation_status: asset.conservation_status ?? "",
        period: asset.period ?? "",
        period_start: asset.period_start?.toString() ?? "",
        period_end: asset.period_end?.toString() ?? "",
        notes: asset.notes ?? "",
        data_source: asset.data_source ?? "",
        ownership: asset.ownership ?? "",
      };
    }
    setForm(next);
    setBaseline(JSON.stringify(next));
    setNameError(false);
  }, [asset]);

  useEffect(() => {
    const t = window.setTimeout(() => nameInputRef.current?.focus({ preventScroll: true }), 120);
    return () => window.clearTimeout(t);
  }, []);

  const applyPoint = useCallback((next: L.LatLngTuple, markDirty: boolean) => {
    setPoint(next);
    setLatInput(next[0].toFixed(6));
    setLngInput(next[1].toFixed(6));
    if (markDirty) setGeometryDirty(true);
  }, []);

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;
    const view = point ?? GHANA_CENTER;
    const map = L.map(mapElRef.current, {
      center: view,
      zoom: point ? 14 : 7,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (point) {
      markerRef.current = L.marker(point, { icon: createIcon(), draggable: true })
        .addTo(map)
        .on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          applyPoint([pos.lat, pos.lng], true);
        });
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      applyPoint([e.latlng.lat, e.latlng.lng], true);
      if (!markerRef.current) {
        markerRef.current = L.marker(e.latlng, { icon: createIcon(), draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          applyPoint([pos.lat, pos.lng], true);
        });
      } else {
        markerRef.current.setLatLng(e.latlng);
      }
    });

    mapRef.current = map;
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 150);
    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLatLangInput = (which: "lat" | "lng", value: string) => {
    if (which === "lat") setLatInput(value);
    else setLngInput(value);
    const lat = parseFloat(which === "lat" ? value : latInput);
    const lng = parseFloat(which === "lng" ? value : lngInput);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      setPoint([lat, lng]);
      setGeometryDirty(true);
      markerRef.current?.setLatLng([lat, lng]);
      mapRef.current?.panTo([lat, lng]);
    }
  };

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      setNameError(true);
      onToast("error", "Asset name is required.");
      nameInputRef.current?.focus();
      return;
    }
    setNameError(false);

    let geometry: Record<string, unknown> | undefined;
    if (isEditing) {
      if (geometryDirty && point) {
        geometry = { type: "Point", coordinates: [point[1], point[0]] };
      }
    } else {
      if (!point) {
        onToast("error", "Pick the asset location on the map before saving.");
        return;
      }
      geometry = { type: "Point", coordinates: [point[1], point[0]] };
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        ...form,
        period_start: form.period_start ? Number(form.period_start) : null,
        period_end: form.period_end ? Number(form.period_end) : null,
      };
      if (geometry) body.geometry = geometry;

      const url = isEditing
        ? apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}`)
        : apiUrl("/api/heritage-assets");
      const method = isEditing ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed.");
      }

      onToast("success", isEditing ? "Asset updated." : "Asset created.");
      onSave();
      onClose();
    } catch (err) {
      onToast("error", err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm bg-transparent border border-ink/15 rounded-none outline-none focus:border-ink transition-colors duration-200 placeholder:text-ink/40 text-ink disabled:cursor-not-allowed";
  const labelClass = "block text-[12px] text-ink-soft mb-1.5";

  const nameInvalid = nameError && !form.name.trim();
  const hasStoredNonPoint =
    isEditing && !!initialGeometryRef.current && initialGeometryRef.current.type !== "Point";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0"
        aria-hidden="true"
      />

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "Edit asset" : "Create asset"}
        className="relative bg-white border border-hairline w-full max-w-[860px] max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-5 border-b border-hairline flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <p className="text-[13px] text-ink-soft">{isEditing ? "Edit asset" : "Create asset"}</p>
            <h2 className="f-heading-4 text-ink mt-0.5 truncate">
              {form.name || (isEditing ? "Untitled asset" : "New heritage asset")}
            </h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="p-1.5 -mr-1.5 shrink-0 text-ink/35 hover:text-ink transition-colors duration-200 ease-house"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={1.25} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form id="asset-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          <div className="space-y-9 max-w-3xl">
            <section>
              <SectionHead title="Basic information" aside="* Required" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                <div className="sm:col-span-2">
                  <label htmlFor="asset-name" className={labelClass}>
                    Name *
                  </label>
                  <input
                    id="asset-name"
                    ref={nameInputRef}
                    value={form.name}
                    onChange={(e) => {
                      set("name", e.target.value);
                      if (nameError) setNameError(false);
                    }}
                    className={cn(inputClass, nameInvalid && "border-brand")}
                    placeholder="Asset name"
                  />
                  {nameInvalid && <p className="mt-1.5 text-[12px] text-brand">Asset name is required.</p>}
                </div>
                <div>
                  <label htmlFor="asset-alt-name" className={labelClass}>
                    Alternative name
                  </label>
                  <input
                    id="asset-alt-name"
                    value={form.alternative_name}
                    onChange={(e) => set("alternative_name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-type" className={labelClass}>
                    Asset type
                  </label>
                  <input
                    id="asset-type"
                    value={form.asset_type}
                    onChange={(e) => set("asset_type", e.target.value)}
                    className={inputClass}
                    placeholder="Object, Site, Document…"
                  />
                </div>
                <div>
                  <label htmlFor="asset-category" className={labelClass}>
                    Category
                  </label>
                  <input
                    id="asset-category"
                    value={form.asset_category}
                    onChange={(e) => set("asset_category", e.target.value)}
                    className={inputClass}
                    placeholder="Artifact, Museum…"
                  />
                </div>
                <div>
                  <label htmlFor="asset-cultural-group" className={labelClass}>
                    Cultural group
                  </label>
                  <input
                    id="asset-cultural-group"
                    value={form.cultural_group}
                    onChange={(e) => set("cultural_group", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="asset-description" className={labelClass}>
                    Description
                  </label>
                  <textarea
                    id="asset-description"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    className={`${inputClass} resize-y min-h-[72px]`}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHead title="Location" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 mb-6">
                <div>
                  <label htmlFor="asset-region" className={labelClass}>
                    Region
                  </label>
                  <input
                    id="asset-region"
                    value={form.region}
                    onChange={(e) => set("region", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-district" className={labelClass}>
                    District
                  </label>
                  <input
                    id="asset-district"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-community" className={labelClass}>
                    Community
                  </label>
                  <input
                    id="asset-community"
                    value={form.community}
                    onChange={(e) => set("community", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-current-location" className={labelClass}>
                    Current location
                  </label>
                  <input
                    id="asset-current-location"
                    value={form.current_location}
                    onChange={(e) => set("current_location", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="asset-origin-location" className={labelClass}>
                    Origin location
                  </label>
                  <input
                    id="asset-origin-location"
                    value={form.origin_location}
                    onChange={(e) => set("origin_location", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="border border-hairline">
                <div className="bg-paper-deep px-3 py-2 flex items-center justify-between gap-3">
                  <span className="text-[12px] text-ink-soft">Map location *</span>
                  <span className={cn("text-[12px] tabular-nums", point ? "text-ink" : "text-brand")}>
                    {point ? `${latInput}, ${lngInput}` : "Click the map to place"}
                  </span>
                </div>
                <div ref={mapElRef} className="h-56 w-full z-0" />
                <div className="grid grid-cols-2 gap-3 px-3 py-3 bg-paper-deep">
                  <div>
                    <label htmlFor="asset-lat" className="block text-[12px] text-ink-soft mb-1">
                      Latitude
                    </label>
                    <input
                      id="asset-lat"
                      type="number"
                      step="any"
                      value={latInput}
                      onChange={(e) => handleLatLangInput("lat", e.target.value)}
                      className="no-spinner w-full px-2 py-1.5 text-[13px] tabular-nums bg-white border border-hairline outline-none focus:border-ink transition-colors duration-200"
                      placeholder="7.9465"
                    />
                  </div>
                  <div>
                    <label htmlFor="asset-lng" className="block text-[12px] text-ink-soft mb-1">
                      Longitude
                    </label>
                    <input
                      id="asset-lng"
                      type="number"
                      step="any"
                      value={lngInput}
                      onChange={(e) => handleLatLangInput("lng", e.target.value)}
                      className="no-spinner w-full px-2 py-1.5 text-[13px] tabular-nums bg-white border border-hairline outline-none focus:border-ink transition-colors duration-200"
                      placeholder="-1.0232"
                    />
                  </div>
                </div>
              </div>
              {!isEditing && !point && (
                <p className="mt-2 text-[12px] text-ink-soft leading-relaxed">
                  A map position is required so the asset appears in the GIS viewer.
                </p>
              )}
              {hasStoredNonPoint && !geometryDirty && (
                <p className="mt-2 text-[12px] text-ink-soft leading-relaxed">
                  This asset stores a {initialGeometryRef.current!.type} geometry. Picking a new map position will
                  replace it with a point.
                </p>
              )}
            </section>

            <section>
              <SectionHead title="Material &amp; condition" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                <div>
                  <label htmlFor="asset-material" className={labelClass}>
                    Material
                  </label>
                  <input
                    id="asset-material"
                    value={form.material}
                    onChange={(e) => set("material", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-secondary-material" className={labelClass}>
                    Secondary material
                  </label>
                  <input
                    id="asset-secondary-material"
                    value={form.secondary_material}
                    onChange={(e) => set("secondary_material", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-technique" className={labelClass}>
                    Technique
                  </label>
                  <input
                    id="asset-technique"
                    value={form.technique}
                    onChange={(e) => set("technique", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-condition" className={labelClass}>
                    Condition
                  </label>
                  <input
                    id="asset-condition"
                    value={form.condition}
                    onChange={(e) => set("condition", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-conservation-status" className={labelClass}>
                    Conservation status
                  </label>
                  <input
                    id="asset-conservation-status"
                    value={form.conservation_status}
                    onChange={(e) => set("conservation_status", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-ownership" className={labelClass}>
                    Ownership
                  </label>
                  <input
                    id="asset-ownership"
                    value={form.ownership}
                    onChange={(e) => set("ownership", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHead title="Period" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="asset-period" className={labelClass}>
                    Period label
                  </label>
                  <input
                    id="asset-period"
                    value={form.period}
                    onChange={(e) => set("period", e.target.value)}
                    className={inputClass}
                    placeholder="Medieval…"
                  />
                </div>
                <div>
                  <label htmlFor="asset-period-start" className={labelClass}>
                    Start year
                  </label>
                  <input
                    id="asset-period-start"
                    type="number"
                    value={form.period_start}
                    onChange={(e) => set("period_start", e.target.value)}
                    className={`${inputClass} no-spinner tabular-nums`}
                    placeholder="1400"
                  />
                </div>
                <div>
                  <label htmlFor="asset-period-end" className={labelClass}>
                    End year
                  </label>
                  <input
                    id="asset-period-end"
                    type="number"
                    value={form.period_end}
                    onChange={(e) => set("period_end", e.target.value)}
                    className={`${inputClass} no-spinner tabular-nums`}
                    placeholder="1600"
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionHead title="Additional" />
              <div className="space-y-5">
                <div>
                  <label htmlFor="asset-data-source" className={labelClass}>
                    Data source
                  </label>
                  <input
                    id="asset-data-source"
                    value={form.data_source}
                    onChange={(e) => set("data_source", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="asset-notes" className={labelClass}>
                    Notes
                  </label>
                  <textarea
                    id="asset-notes"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    className={`${inputClass} resize-y min-h-[72px]`}
                    rows={3}
                  />
                </div>
              </div>
            </section>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-hairline flex items-center justify-between gap-3 shrink-0 bg-white">
          <p className="text-[12px] text-ink/40 hidden sm:block">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={requestClose}
              className="px-4 py-2 f-caption border border-ink/15 hover:border-ink text-ink transition-colors duration-200 ease-house"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="asset-form"
              disabled={saving}
              className="px-5 py-2 f-caption bg-ink text-white hover:bg-ink/80 disabled:opacity-40 transition-colors duration-200 ease-house disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </motion.div>

      {showDiscard && (
        <ConfirmModal
          title="Discard changes?"
          body="Your edits have not been saved yet. Closing now will discard them."
          confirmLabel="Discard"
          onConfirm={() => {
            setShowDiscard(false);
            onClose();
          }}
          onCancel={() => setShowDiscard(false)}
        />
      )}
    </div>
  );
};
