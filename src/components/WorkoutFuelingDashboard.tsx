'use client';

import React, { useState } from 'react';
import { calculateFuelingRequirements, VdotZone } from '@/lib/vdotEngine';

interface ProductOption {
  category: 'raw_powder' | 'commercial_gel' | 'candy' | 'whole_food';
  name: string;
  servingDesc: string;
  carbsGrams: number;
  costPerServing: number;
  upfrontCost: number;
  totalServings: number;
  link?: string;
}

export default function WorkoutFuelingDashboard() {
  // User & Session Inputs
  const [bodyMassKg, setBodyMassKg] = useState<number>(70);
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [intensityZone, setIntensityZone] = useState<VdotZone>('T');
  const [sessionType, setSessionType] = useState<string>('Threshold / Long Intervals');

  // Compute Targets using the Engine
  const fueling = calculateFuelingRequirements(durationMinutes, intensityZone, bodyMassKg);

  // Mock product catalog mapped to calculated targets
  const getProductOptions = (carbsNeeded: number): ProductOption[] => [
    {
      category: 'raw_powder',
      name: 'DIY Maltodextrin + Fructose + Sodium Citrate',
      servingDesc: `${carbsNeeded}g Carbs (1:0.8 Ratio) + 500mg Sodium`,
      carbsGrams: carbsNeeded,
      costPerServing: Number(((carbsNeeded / 60) * 1.07).toFixed(2)),
      upfrontCost: 75.0,
      totalServings: 70,
      link: 'https://www.bulksupplements.com',
    },
    {
      category: 'commercial_gel',
      name: 'Maurten Drink Mix 320 / SiS Beta Fuel',
      servingDesc: '1 Sachet (80g Carbs)',
      carbsGrams: 80,
      costPerServing: 3.0,
      upfrontCost: 42.0,
      totalServings: 14,
      link: 'https://www.maurten.com',
    },
    {
      category: 'candy',
      name: 'Swedish Fish',
      servingDesc: `${Math.round((carbsNeeded / 31) * 5)} pieces (~${carbsNeeded}g Carbs)`,
      carbsGrams: carbsNeeded,
      costPerServing: 0.9,
      upfrontCost: 4.5,
      totalServings: 5,
      link: 'https://www.snackworks.com',
    },
  ];

  const totalIntraCarbs = (fueling.intraWorkout.carbsPerHrGrams * (durationMinutes / 60));
  const productOptions = getProductOptions(totalIntraCarbs);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Session Configuration Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-emerald-400 mb-4">Workout Session Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Body Mass (kg)</label>
            <input
              type="number"
              value={bodyMassKg}
              onChange={(e) => setBodyMassKg(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Duration (Mins)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">VDOT Intensity Zone</label>
            <select
              value={intensityZone}
              onChange={(e) => setIntensityZone(e.target.value as VdotZone)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            >
              <option value="E">Easy / Recovery (E)</option>
              <option value="M">Marathon Pace (M)</option>
              <option value="T">Threshold Pace (T)</option>
              <option value="I">Intervals / VO2 Max (I)</option>
              <option value="R">Repetition / Sprints (R)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Session Type</label>
            <input
              type="text"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Primary Fueling Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pre-Workout Strategy */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pre-Workout</span>
          <h3 className="text-2xl font-extrabold mt-1">{fueling.preWorkout.carbsGrams}g Carbs</h3>
          <p className="text-xs text-slate-400 mt-1">Consume ~{fueling.preWorkout.timingWindowMins} mins before session</p>
          <div className="mt-4 space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Recommended Options:</span>
            {fueling.preWorkout.recommendedFoods.map((food, i) => (
              <div key={i} className="text-sm bg-slate-800/60 p-2 rounded border border-slate-700/50">
                {food}
              </div>
            ))}
          </div>
        </div>

        {/* Intra-Workout Hydration & Electrolytes */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Intra-Workout Hourly Rates</span>
          <h3 className="text-2xl font-extrabold mt-1">{fueling.intraWorkout.carbsPerHrGrams}g Carbs / hr</h3>
          <p className="text-xs text-slate-400 mt-1">Ratio: {fueling.intraWorkout.carbRatio}</p>
          
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="text-slate-400 block">Fluid Rate</span>
              <strong className="text-sm">{fueling.intraWorkout.fluidPerHrMl} mL/hr</strong>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="text-slate-400 block">Sodium (Na+)</span>
              <strong className="text-sm">{fueling.intraWorkout.sodiumPerHrMg} mg/hr</strong>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="text-slate-400 block">Potassium (K+)</span>
              <strong className="text-sm">{fueling.intraWorkout.potassiumPerHrMg} mg/hr</strong>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <span className="text-slate-400 block">Magnesium (Mg++)</span>
              <strong className="text-sm">{fueling.intraWorkout.magnesiumPerHrMg} mg/hr</strong>
            </div>
          </div>
        </div>

        {/* Post-Workout Recovery */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Post-Workout Recovery</span>
          <h3 className="text-2xl font-extrabold mt-1">{fueling.postWorkout.proteinGrams}g Protein</h3>
          <p className="text-xs text-slate-400 mt-1">Paired with {fueling.postWorkout.carbsGrams}g Carbs (~3g Leucine)</p>
          <div className="mt-4 bg-slate-800/60 p-3 rounded border border-slate-700/50 text-xs space-y-1">
            <p className="text-slate-300"><strong>Fluid Goal:</strong> Rehydrate {fueling.postWorkout.fluidReplacementPct}% of total sweat loss within 4 hours.</p>
            <p className="text-slate-400">Include whole foods like Greek yogurt, banana, or high-leucine whey isolates.</p>
          </div>
        </div>
      </div>

      {/* Ergogenic Supplement Stacking */}
      {fueling.ergogenicSupplements.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-purple-400 mb-3">Ergogenic Supplement Protocol</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fueling.ergogenicSupplements.map((supp, i) => (
              <div key={i} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-white font-semibold">{supp.name}</strong>
                  <span className="text-xs bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">{supp.dosage}</span>
                </div>
                <p className="text-xs text-slate-400">{supp.timing}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intra-Workout Fueling Option Comparison */}
      {totalIntraCarbs > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Intra-Workout Fuel Options</h3>
              <p className="text-xs text-slate-400">Targeting {totalIntraCarbs}g total carbohydrates for this session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productOptions.map((opt, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    opt.category === 'raw_powder' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    opt.category === 'commercial_gel' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {opt.category.replace('_', ' ')}
                  </span>
                  <h4 className="font-bold text-white mt-2 text-base">{opt.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{opt.servingDesc}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-700/50 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Cost Per Session</span>
                    <strong className="text-xl font-black text-white">${opt.costPerServing.toFixed(2)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Upfront Outlay</span>
                    <span className="text-xs font-semibold text-slate-300">${opt.upfrontCost.toFixed(2)} ({opt.totalServings} serv)</span>
                  </div>
                </div>

                {opt.link && (
                  <a
                    href={opt.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block text-center py-2 bg-slate-700 hover:bg-slate-600 text-xs font-bold rounded text-slate-200 transition"
                  >
                    View Product
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}