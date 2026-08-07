import React, { useState, useEffect } from "react";

interface TimeSliderProps {
  yearRange: [number, number];
  onChange: (range: [number, number]) => void;
  dataMin?: number;
  dataMax?: number;
  darkMode?: boolean;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  yearRange,
  onChange,
  dataMin = 1100,
  dataMax = 2026,
  darkMode = false,
}) => {
  const [localRange, setLocalRange] = useState<[number, number]>(yearRange);

  useEffect(() => {
    setLocalRange(yearRange);
  }, [yearRange]);

  const yearToPercent = (year: number) =>
    ((year - dataMin) / (dataMax - dataMin)) * 100;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clamped = Math.min(val, localRange[1] - 1);
    const newRange: [number, number] = [clamped, localRange[1]];
    setLocalRange(newRange);
    onChange(newRange);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const clamped = Math.max(val, localRange[0] + 1);
    const newRange: [number, number] = [localRange[0], clamped];
    setLocalRange(newRange);
    onChange(newRange);
  };

  const setPreset = (min: number, max: number) => {
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
  const text = darkMode ? "text-white" : "text-black";
  const muted = darkMode ? "text-white/40" : "text-black/40";
  const trackBg = darkMode ? "bg-white/10" : "bg-black/10";
  const trackActive = darkMode ? "bg-[#FF6B6B]" : "bg-[#E4002B]";
  const thumbClasses = darkMode
    ? "[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:border-[#FF6B6B]"
    : "[&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:bg-black [&::-webkit-slider-thumb]:border-[#E4002B]";

  const presets = [
    { label: "ALL HORIZONS", min: dataMin, max: dataMax },
    { label: "PRE-COLONIAL (<1874)", min: dataMin, max: 1874 },
    { label: "COLONIAL (1874–1957)", min: 1874, max: 1957 },
    { label: "POST-INDEPENDENCE", min: 1957, max: dataMax },
  ];

  return (
    <div
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] ${bg} border ${border} shadow-lg px-5 py-3.5 max-sm:bottom-16 select-none flex flex-col gap-2`}
      style={{
        width: 540,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {/* Top Header & Era Presets */}
      <div className="flex items-center justify-between gap-2 border-b pb-2 border-white/5">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] uppercase font-mono tracking-widest ${muted}`}>
            TIME HORIZON
          </span>
          <span className={`text-[11px] font-mono font-bold ${text} tracking-wider tabular-nums`}>
            {localRange[0]} CE — {localRange[1]} CE
          </span>
        </div>

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
                    : `${border} ${muted} hover:${text}`
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
          className={`absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer ${thumbClasses}`}
        />
        <input
          type="range"
          min={dataMin}
          max={dataMax}
          value={localRange[1]}
          onChange={handleEndChange}
          className={`absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:cursor-pointer ${thumbClasses}`}
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
