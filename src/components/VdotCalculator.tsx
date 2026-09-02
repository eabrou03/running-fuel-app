// components/VdotCalculator.tsx
'use client';

import React, { useState } from 'react';
import { calculateVDOT } from '@/lib/vdotEngine';

const PRESET_DISTANCES = [
  { label: '1500m', meters: 1500 },
  { label: '1 Mile', meters: 1609.34 },
  { label: '5K', meters: 5000 },
  { label: '10K', meters: 10000 },
  { label: 'Half Marathon', meters: 21097.5 },
  { label: 'Marathon', meters: 42195 },
];

export default function VdotCalculator({ onVdotCalculated }: { onVdotCalculated: (vdot: number) => void }) {
  const [distanceMeters, setDistanceMeters] = useState<number>(5000);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(20);
  const [seconds, setSeconds] = useState<number>(0);
  const [vdotResult, setVdotResult] = useState<number | null>(null);

  const handleCompute = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0 || distanceMeters <= 0) return;

    const score = calculateVDOT(distanceMeters, totalSeconds);
    setVdotResult(score);
    onVdotCalculated(score);
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 max-w-md">
      <h3 className="text-lg font-bold mb-4">Assign Baseline Fitness (VDOT)</h3>

      {/* Preset Distance Selector */}
      <div className="mb-4">
        <label className="block text-xs uppercase text-slate-400 mb-2">Select Distance</label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_DISTANCES.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => setDistanceMeters(d.meters)}
              className={`py-2 text-xs font-semibold rounded ${
                distanceMeters === d.meters ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Input */}
      <div className="mb-6">
        <label className="block text-xs uppercase text-slate-400 mb-2">Personal Best Time</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="HH"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-1/3 p-2 bg-slate-800 rounded text-center text-sm"
          />
          <input
            type="number"
            placeholder="MM"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-1/3 p-2 bg-slate-800 rounded text-center text-sm"
          />
          <input
            type="number"
            placeholder="SS"
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
            className="w-1/3 p-2 bg-slate-800 rounded text-center text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleCompute}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-sm rounded transition"
      >
        Calculate & Save VDOT
      </button>

      {vdotResult && (
        <div className="mt-4 p-3 bg-slate-800 rounded text-center border border-emerald-500/30">
          <span className="text-xs text-slate-400 uppercase">Calculated VDOT Score</span>
          <p className="text-3xl font-extrabold text-emerald-400">{vdotResult}</p>
        </div>
      )}
    </div>
  );
}