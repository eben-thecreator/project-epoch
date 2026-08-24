import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { HeritageAsset } from "./HeritageLayer";
import { assetPoint } from "../lib/atlas";

interface DensityLayerProps {
  assets: HeritageAsset[];
  visible: boolean;
}

/**
 * Heritage density — a single-hue additive heat field drawn on a canvas
 * pane. Every point contributes a soft radial gradient in the brand red;
 * overlaps compound into the concentrations of documented heritage.
 * Redrawn on settle (moveend/zoomend), never per frame.
 */
export const DensityLayer: React.FC<DensityLayerProps> = ({
  assets,
  visible,
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Array<[number, number]>>([]);

  useEffect(() => {
    pointsRef.current = assets
      .map((a) => assetPoint(a))
      .filter((p): p is [number, number] => p !== null);
  }, [assets]);

  useEffect(() => {
    if (!visible) return;

    const canvas = L.DomUtil.create("canvas", "atlas-density-canvas") as HTMLCanvasElement;
    canvasRef.current = canvas;

    const DensityCanvasLayer = L.Layer.extend({
      onAdd: function (this: L.Layer) {
        const pane = this.getPane("overlayPane");
        pane?.appendChild(canvas);
        map.on("moveend zoomend resize", draw);
        draw();
      },
      onRemove: function (this: L.Layer) {
        L.DomUtil.remove(canvas);
        map.off("moveend zoomend resize", draw);
      },
    }) as unknown as new () => L.Layer;

    const layer = new DensityCanvasLayer();
    map.addLayer(layer);

    function draw() {
      const c = canvasRef.current;
      if (!c) return;
      const size = map.getSize();
      if (c.width !== size.x || c.height !== size.y) {
        c.width = size.x;
        c.height = size.y;
      }
      c.style.width = `${size.x}px`;
      c.style.height = `${size.y}px`;
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(c, topLeft);

      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);

      const zoom = map.getZoom();
      const radius = Math.min(64, Math.max(14, 10 + zoom * 3.2));
      ctx.globalCompositeOperation = "lighter";

      for (const [lat, lng] of pointsRef.current) {
        const pt = map.latLngToContainerPoint(L.latLng(lat, lng));
        if (
          pt.x < -radius || pt.y < -radius ||
          pt.x > size.x + radius || pt.y > size.y + radius
        ) continue;
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
        g.addColorStop(0, "rgba(228,0,43,0.16)");
        g.addColorStop(0.6, "rgba(228,0,43,0.05)");
        g.addColorStop(1, "rgba(228,0,43,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    return () => {
      map.removeLayer(layer);
      canvasRef.current = null;
    };
  }, [map, visible]);

  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      c.style.opacity = visible ? "1" : "0";
    }
  }, [visible]);

  return null;
};

DensityLayer.displayName = "DensityLayer";
