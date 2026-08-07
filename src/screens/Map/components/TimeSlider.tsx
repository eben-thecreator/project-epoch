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
  const [localRange, setLocalRange] = useState<[number, number]>(
    yearRange
  );

  useEffect(() => {
    setLocalRange(yearRange);
  }, [yearRange]);

  const yearToPercent = (year: number) =>
    ((year - dataMin) / (dataMax - dataMin)) * 100;

  const handleStartChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = Number(e.target.value);
    const clamped = Math.min(val, localRange[1] - 1);
    const newRange: [number, number] = [clamped, localRange[1]];
    setLocalRange(newRange);
    onChange(newRange);
  };

  const handleEndChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = Number(e.target.value);
    const clamped = Math.max(val, localRange[0] + 1);
    const newRange: [number, number] = [localRange[0], clamped];
    setLocalRange(newRange);
    onChange(newRange);
  };

  const leftPct = yearToPercent(localRange[0]);
  const rightPct = yearToPercent(localRange[1]);

  const span = dataMax - dataMin;
  const tickInterval =
    span <= 200 ? 50 : span <= 500 ? 100 : 200;
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
  const border = darkMode
    ? "border-white/10"
    : "border-black/10";
  const text = darkMode ? "text-white/90" : "text-black";
  const trackBg = darkMode ? "bg-white/10" : "bg-black/10";
  const trackActive = darkMode
    ? "bg-white/50"
    : "bg-black/50";
  const thumbClasses = darkMode
    ? "[&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:bg-white"
    : "[&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:bg-black";
  const tickColor = darkMode
    ? "text-white/25"
    : "text-black/25";

  return (
    <div
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] ${bg} border ${border} shadow-sm px-5 py-3 max-sm:bottom-16`}
      style={{
        width: 520,
        maxWidth: "calc(100vw - 40px)",
      }}
    >
      <div className="flex items-center justify-center mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-light ${text} tracking-wide tabular-nums`}
          >
            {localRange[0]}
          </span>
          <span
            className={`text-[10px] ${darkMode ? "text-white/20" : "text-black/20"} mx-1.5`}
          >
            &mdash;
          </span>
          <span
            className={`text-sm font-light ${text} tracking-wide tabular-nums`}
          >
            {localRange[1]}
          </span>
        </div>
      </div>

      <div className="relative h-6 mx-1">
        <div
          className={`absolute top-2.5 left-0 right-0 h-[1px] ${trackBg}`}
        />
        <div
          className={`absolute top-2.5 h-[1px] ${trackActive}`}
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
          className={`absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer ${thumbClasses}`}
        />
        <input
          type="range"
          min={dataMin}
          max={dataMax}
          value={localRange[1]}
          onChange={handleEndChange}
          className={`absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer ${thumbClasses}`}
        />
      </div>

      <div className="flex justify-between mx-1 mt-0.5">
        {ticks.map((y) => (
          <span
            key={y}
            className={`text-[8px] ${tickColor} font-medium tracking-wider`}
          >
            {y}
          </span>
        ))}
      </div>
    </div>
  );
};

TimeSlider.displayName = "TimeSlider";
