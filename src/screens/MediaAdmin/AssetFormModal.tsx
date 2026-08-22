import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { apiUrl } from "../../lib/api";
import { adminFetch } from "../../lib/adminAuth";
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

/** Default map view centred on Ghana */
const GHANA_CENTER: L.LatLngTuple = [7.9465, -1.0232];

const getInitialPoint = (
  asset: HeritageAsset | null
): L.LatLngTuple | null => {
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

export const AssetFormModal = ({ asset, onClose, onSave, onToast }: AssetFormModalProps): JSX.Element => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const isEditing = !!asset;

  const initialPoint = getInitialPoint(asset);
  const initialGeometryRef = useRef(asset?.geometry ?? null);
  const [point, setPoint] = useState<L.LatLngTuple | null>(
    initialPoint ?? (isEditing ? null : null)
  );
  const [geometryDirty, setGeometryDirty] = useState(false);
  const [latInput, setLatInput] = useState(initialPoint ? String(initialPoint[0]) : "");
  const [lngInput, setLngInput] = useState(initialPoint ? String(initialPoint[1]) : "");

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (asset) {
      setForm({
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
      });
    }
  }, [asset]);

  // Initialise the Leaflet picker once
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => mapRef.current?.invalidateSize(), 150);
    return () => {
      clearTimeout(t);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPoint = useCallback((next: L.LatLngTuple, dirty: boolean) => {
    setPoint(next);
    setLatInput(next[0].toFixed(6));
    setLngInput(next[1].toFixed(6));
    if (dirty) setGeometryDirty(true);
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
      onToast("error", "Asset name is required.");
      return;
    }

    let geometry: Record<string, unknown> | undefined;
    if (isEditing) {
      if (geometryDirty && point) {
        geometry = { type: "Point", coordinates: [point[1], point[0]] };
      }
      // otherwise keep the stored geometry untouched
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

      const url = isEditing ? apiUrl(`/api/heritage-assets/${encodeURIComponent(asset.id)}`) : apiUrl("/api/heritage-assets");
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

  const inputClass = "w-full px-3 py-2 text-xs bg-black/5 rounded-lg border-0 outline-none focus:ring-2 focus:ring-[#E4002B]/30 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-black/50 mb-1.5 block";
  const hasStoredNonPoint = isEditing && !!initialGeometryRef.current && initialGeometryRef.current.type !== "Point";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-sm font-black text-[#111]">{isEditing ? "Edit Asset" : "Create Asset"}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors">
            <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            {/* Basic Info */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#E4002B] mb-3">Basic Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Name *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="Asset name" />
                </div>
                <div>
                  <label className={labelClass}>Alternative Name</label>
                  <input value={form.alternative_name} onChange={(e) => set("alternative_name", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Asset Type</label>
                  <input value={form.asset_type} onChange={(e) => set("asset_type", e.target.value)} className={inputClass} placeholder="e.g. Object, Site, Document" />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <input value={form.asset_category} onChange={(e) => set("asset_category", e.target.value)} className={inputClass} placeholder="e.g. Artifact, Museum" />
                </div>
                <div>
                  <label className={labelClass}>Cultural Group</label>
                  <input value={form.cultural_group} onChange={(e) => set("cultural_group", e.target.value)} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputClass} resize-none`} rows={3} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#E4002B] mb-3">Location</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Region</label>
                  <input value={form.region} onChange={(e) => set("region", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>District</label>
                  <input value={form.district} onChange={(e) => set("district", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Community</label>
                  <input value={form.community} onChange={(e) => set("community", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Current Location</label>
                  <input value={form.current_location} onChange={(e) => set("current_location", e.target.value)} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Origin Location</label>
                  <input value={form.origin_location} onChange={(e) => set("origin_location", e.target.value)} className={inputClass} />
                </div>
              </div>

              {/* Coordinates picker */}
              <div className="rounded-xl overflow-hidden border border-black/10">
                <div className="bg-black/[0.03] px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black/50">
                    Map Location *
                  </span>
                  <span className={`text-[10px] font-mono ${point ? "text-black/60" : "text-[#E4002B]"}`}>
                    {point ? `${latInput}, ${lngInput}` : "Click the map to place"}
                  </span>
                </div>
                <div ref={mapElRef} className="h-56 w-full z-0" />
                <div className="grid grid-cols-2 gap-3 px-3 py-3 bg-black/[0.03]">
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-black/40 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={latInput}
                      onChange={(e) => handleLatLangInput("lat", e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-white rounded-lg border border-black/10 outline-none focus:border-[#E4002B]"
                      placeholder="7.9465"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-mono text-black/40 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={lngInput}
                      onChange={(e) => handleLatLangInput("lng", e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-white rounded-lg border border-black/10 outline-none focus:border-[#E4002B]"
                      placeholder="-1.0232"
                    />
                  </div>
                </div>
              </div>
              {!isEditing && !point && (
                <p className="mt-2 text-[10px] text-[#E4002B]/80 font-semibold">
                  A map position is required so the asset appears in the GIS viewer.
                </p>
              )}
              {hasStoredNonPoint && !geometryDirty && (
                <p className="mt-2 text-[10px] text-black/45">
                  This asset stores a {initialGeometryRef.current!.type} geometry. Picking a new map
                  position will replace it with a point.
                </p>
              )}
            </div>

            {/* Material & Condition */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#E4002B] mb-3">Material & Condition</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Material</label>
                  <input value={form.material} onChange={(e) => set("material", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Secondary Material</label>
                  <input value={form.secondary_material} onChange={(e) => set("secondary_material", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Technique</label>
                  <input value={form.technique} onChange={(e) => set("technique", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Condition</label>
                  <input value={form.condition} onChange={(e) => set("condition", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Conservation Status</label>
                  <input value={form.conservation_status} onChange={(e) => set("conservation_status", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Ownership</label>
                  <input value={form.ownership} onChange={(e) => set("ownership", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Period */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#E4002B] mb-3">Period</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Period Label</label>
                  <input value={form.period} onChange={(e) => set("period", e.target.value)} className={inputClass} placeholder="e.g. Medieval" />
                </div>
                <div>
                  <label className={labelClass}>Start Year</label>
                  <input type="number" value={form.period_start} onChange={(e) => set("period_start", e.target.value)} className={inputClass} placeholder="e.g. 1400" />
                </div>
                <div>
                  <label className={labelClass}>End Year</label>
                  <input type="number" value={form.period_end} onChange={(e) => set("period_end", e.target.value)} className={inputClass} placeholder="e.g. 1600" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#E4002B] mb-3">Additional</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Data Source</label>
                  <input value={form.data_source} onChange={(e) => set("data_source", e.target.value)} className={inputClass} />
                </div>
                <div></div>
                <div className="col-span-2">
                  <label className={labelClass}>Notes</label>
                  <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className={`${inputClass} resize-none`} rows={3} />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-[10px] font-bold uppercase rounded-lg bg-[#E4002B] text-white hover:bg-[#C40025] transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            {!saving && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
