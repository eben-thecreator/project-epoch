import React, { useState, useEffect, useRef, useCallback } from "react";

interface TimeSliderProps {
  yearRange: [number, number];
  onChange: (range: [number, number]) => void;
  dataMin?: number;
  dataMax?: number;
  darkMode?: boolean;
}

const ANIM_TICK_MS = 60;

export const TimeSlider: React.FC<TimeSliderProps> = ({
  yearRange,
  onChange,
  dataMin = 1100,
  dataMax = 2026,
  darkMode = false,
}) => {
  const [localRange, setLocalRange] = useState<[number, number]>(yearRange);
  const [playing, setPlaying] = useState(false);
  const animRef = useRef<number | null>(null);
  const latestRange = useRef(yearRange);

  useEffect(() => {
    setLocalRange(yearRange);
  }, [yearRange]);

  useEffect(() => {
    latestRange.current = localRange;
  }, [localRange]);

  const stopAnimation = useCallback(() => {
    if (animRef.current !== null) {
      window.clearInterval(animRef.current);
      animRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopAnimation();
      return;
    }
    setPlaying(true);
    // Sweep the end year forward from its current position (or restart from the beginning)
    let end =
      latestRange.current[1] >= dataMax ? dataMin + 1 : latestRange.current[1];
    const startBase = latestRange.current[0] <= dataMin ? dataMin : latestRange.current[0];
    animRef.current = window.setInterval(() => {
      end += 1;
      if (end >= dataMax) {
        const final: [number, number] = [startBase, dataMax];
        setLocalRange(final);
        onChange(final);
        stopAnimation();
        return;
      }
      const next: [number, number] = [startBase, end];
      setLocalRange(next);
      onChange(next);
    }, ANIM_TICK_MS);
  }, [playing, dataMin, dataMax, onChange, stopAnimation]);

  const yearToPercent = (year: number) =>
    dataMax > dataMin ? ((year - dataMin) / (dataMax - dataMin)) * 100 : 0;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopAnimation();
    const val = Number(e.target.value);
    const clamped = Math.min(val, localRange[1] - 1);
    const newRange: [number, number] = [clamped, localRange[1]];
    setLocalRange(newRange);
    onChange(newRange);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopAnimation();
    const val = Number(e.target.value);
    const clamped = Math.max(val, localRange[0] + 1);
    const newRange: [number, number] = [localRange[0], clamped];
    setLocalRange(newRange);
    onChange(newRange);
  };

  const setPreset = (min: number, max: number) => {
    stopAnimation();
    const clampedMin = Math.max(dataMin, min);
    const clampedMax = Math.min(dataMax, max);
    const range: [number, number] = [clampedMin, clampedMax];
    setLocalRange(range);
    onChange(range);
  };

  const leftPct = yearToPercent(localRange[0]);
  const rightPct = yearToPercent(localRange[1]);

  const span = dataMax - dataMin;
  const tickInterval = span <= 200 ? 50 : span <= 500 ? 100 : 200;
  const ticks: number[] = [];
  for (
    let y = Math.ceil(dataMin / tickInterval) * tickInterval;
    y <= dataMax;
    y += tickInterval
  ) {
    ticks.push(y);
  }
  if (ticks[ticks.length - 1] !== dataMax) ticks.push(dataMax);

  const bg = darkMode ? "bg-[#0d0d0d]" : "bg-white";
  const border = darkMode ? "border-white/15" : "border-black/15";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const trackBg = darkMode ? "bg-white/10" : "bg-black/10";
  const trackActive = darkMode ? "bg-[#FF6B6B]" : "bg-[#E4002B]";
  const thumbClasses = darkMode
    ? "[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:border-[#FF6B6B]"
    : "[&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:bg-black [&::-webkit-slider-thumb]:border-[#E4002B]";
  const presetIdle = `${border} ${muted} hover:bg-black/5 ${darkMode ? "hover:bg-white/10 hover:text-white" : "hover:text-black"}`;

  const presets = [
    { label: "ALL", min: dataMin, max: dataMax },
    { label: "PRE-COLONIAL", min: dataMin, max: 1873 },
    { label: "COLONIAL", min: 1874, max: 1957 },
    { label: "POST-INDEP.", min: 1957, max: dataMax },
  ];

  return (
    <div
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] ${bg} border ${border} shadow-lg px-5 py-3.5 max-sm:bottom-16 select-none flex flex-col gap-2`}
      style={{
        width: 540,
        maxWidth: "calc(100vw - 32px)",
      }}
      role="group"
      aria-label="Temporal filter"
    >
      {/* Top Header & Era Presets */}
      <div className="flex items-center justify-between gap-2 border-b pb-2 border-black/5">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          title={playing ? "Pause temporal sweep" : "Play temporal sweep"}
          aria-label={playing ? "Pause temporal sweep" : "Play temporal sweep"}
          className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full transition-colors ${
            playing ? "bg-[#E4002B] text-white" : `${trackBg} ${muted} hover:text-[#E4002B]`
          }`}
        >
          {playing ? (
            <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="3.5" height="10" rx="0.5" />
              <rect x="7.5" y="1" width="3.5" height="10" rx="0.5" />
            </svg>
          ) : (
            <svg className="w-2.5 h-2.5 ml-0.5" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 1.2v9.6a.8.8 0 001.22.68l7.6-4.8a.8.8 0 000-1.36l-7.6-4.8A.8.8 0 002 1.2z" />
            </svg>
          )}
        </button>

        {/* Quick Era Presets */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {presets.map((p) => {
            const isActive =
              localRange[0] === Math.max(dataMin, p.min) &&
              localRange[1] === Math.min(dataMax, p.max);
            return (
              <button
                key={p.label}
                onClick={() => setPreset(p.min, p.max)}
                className={`text-[8px] font-mono font-semibold uppercase px-1.5 py-0.5 border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-[#E4002B] border-[#E4002B] text-white"
                    : presetIdle
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range Track & Sliders */}
      <div className="relative h-6 my-0.5">
        <div className={`absolute top-2.5 left-0 right-0 h-[2px] ${trackBg}`} />
        <div
          className={`absolute top-2.5 h-[2px] ${trackActive}`}
          style={{
            left: `${leftPct}%`,
            width: `${rightPct - leftPct}%`,
          }}
        />

        <input
          type="range"
          min={dataMin}
          max={dataMax}
          value={localRange[0]}
          onChange={handleStartChange}
          aria-label="Period start year"
          className={`absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer ${thumbClasses}`}
        />
        <input
          type="range"
          min={dataMin}
          max={dataMax}
          value={localRange[1]}
          onChange={handleEndChange}
          aria-label="Period end year"
          className={`absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer ${thumbClasses}`}
        />
      </div>

      {/* Axis Ticks */}
      <div className="flex justify-between mx-1">
        {ticks.map((y) => (
          <span
            key={y}
            className={`text-[8px] font-mono ${muted} tabular-nums`}
          >
            {y}
          </span>
        ))}
      </div>
    </div>
  );
};

TimeSlider.displayName = "TimeSlider";
