'use client';

import React, { useState, useEffect } from 'react';
import ScienceDrawer from '@/components/ScienceDrawer';
import { fetchProductsByTiming, updateUserProfile, logWorkoutSession } from '@/lib/supabaseQueries';
import { calculateFuelingRequirements } from '@/lib/vdotEngine';
import { supabase } from '@/lib/supabaseClient';

export default function WorkoutFuelingDashboard() {
  // UI & Drawer State
  const [isScienceOpen, setIsScienceOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);

  // Runner Inputs & Workout Controls
  const [bodyMassKg, setBodyMassKg] = useState<number>(70);
  const [vdot, setVdot] = useState<number>(52);
  const [sessionType, setSessionType] = useState<string>('Long Run');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [intensityZone, setIntensityZone] = useState<string>('Marathon Pace');

  // Supabase Data State
  const [products, setProducts] = useState<any[]>([]);

  // Citation tags passed to the research drawer
  const activeTags = ['dual_carbs', 'electrolytes', 'sodium_bicarb'];

  // 1. Fetch live fuel products from Supabase on component load
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const dbProducts = await fetchProductsByTiming('intra_workout');
        if (dbProducts) {
          setProducts(dbProducts);
        }
      } catch (error) {
        console.error('Error loading products from database:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  // 2. Dynamic Fueling Target Calculations using vdotEngine
  const calculateTargets = () => {
    const hours = durationMinutes / 60;

    if (typeof calculateFuelingRequirements === 'function') {
      try {
        // Cast intensityZone as any to align with VdotZone parameter requirement
        const res = calculateFuelingRequirements(
          vdot,
          intensityZone as any,
          durationMinutes,
          bodyMassKg
        );
        if (res) {
          const targetData = res as any;
          const carbRate = Number(
            targetData.carbRate ?? targetData.carbsPerHour ?? targetData.carb_rate ?? targetData.carbs_per_hour ?? 60
          );
          const totalCarbs = Number(
            targetData.totalCarbs ?? targetData.total_carbs ?? Math.round(carbRate * hours)
          );
          const fluidMl = Number(
            targetData.fluidMl ?? targetData.fluid_ml ?? targetData.fluidMlPerHour ?? Math.round(500 * hours)
          );
          const sodiumMg = Number(
            targetData.sodiumMg ?? targetData.sodium_mg ?? targetData.sodiumMgPerHour ?? Math.round(600 * hours)
          );

          return { carbRate, totalCarbs, fluidMl, sodiumMg };
        }
      } catch (error) {
        console.error('Error calculating VDOT fueling requirements:', error);
      }
    }

    // Fallback calculation if vdotEngine is unavailable
    let zoneMultiplier = 1.0;
    if (intensityZone === 'Threshold Pace') zoneMultiplier = 1.15;
    if (intensityZone === 'Interval Pace') zoneMultiplier = 1.25;

    let baseCarbRate = 30;
    if (durationMinutes > 60 && durationMinutes <= 120) baseCarbRate = 60;
    if (durationMinutes > 120) baseCarbRate = 90;

    const carbRate = Math.round(baseCarbRate * (vdot / 50) * zoneMultiplier);

    return {
      carbRate,
      totalCarbs: Math.round(carbRate * hours),
      fluidMl: Math.round(500 * hours * (bodyMassKg / 70)),
      sodiumMg: Math.round(600 * hours),
    };
  };

  const targets = calculateTargets();

  // 3. Save Workout Session with Dynamic Supabase User Auth
  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        alert('Please log in to save your workout session.');
        return;
      }

      await updateUserProfile(userId, bodyMassKg, vdot);
      await logWorkoutSession({
        user_id: userId,
        session_name: sessionType,
        duration_minutes: durationMinutes,
        intensity_zone: intensityZone,
        session_type: sessionType,
        is_periodized_block: false,
      });

      alert('Workout session & profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save workout session.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              VDOT Fueling Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Personalized race & training fueling calculator
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsScienceOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              🔬 View Supporting Evidence
            </button>

            <button
              onClick={handleSaveSession}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
            >
              {isSaving ? 'Saving...' : '💾 Save Session'}
            </button>
          </div>
        </header>

        {/* Input Controls */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-900 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Body Mass (kg)</label>
            <input
              type="number"
              value={bodyMassKg}
              onChange={(e) => setBodyMassKg(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">VDOT Score</label>
            <input
              type="number"
              value={vdot}
              onChange={(e) => setVdot(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Duration (min)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Intensity Zone</label>
            <select
              value={intensityZone}
              onChange={(e) => setIntensityZone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Easy Pace">Easy Pace (E)</option>
              <option value="Marathon Pace">Marathon Pace (M)</option>
              <option value="Threshold Pace">Threshold Pace (T)</option>
              <option value="Interval Pace">Interval Pace (I)</option>
            </select>
          </div>
        </section>

        {/* Dynamic VDOT Targets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Target Intake</span>
            <div className="text-3xl font-extrabold text-white mt-2">{targets.carbRate} g/hr</div>
            <p className="text-xs text-slate-400 mt-1">Total Carbs: {targets.totalCarbs}g</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Hydration</span>
            <div className="text-3xl font-extrabold text-white mt-2">{targets.fluidMl} ml</div>
            <p className="text-xs text-slate-400 mt-1">Total fluid target</p>
          </div>

          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Electrolytes</span>
            <div className="text-3xl font-extrabold text-white mt-2">{targets.sodiumMg} mg</div>
            <p className="text-xs text-slate-400 mt-1">Sodium intake target</p>
          </div>
        </section>

        {/* Cost-Optimized Products List */}
        <section className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Cost-Optimized Fueling Comparisons</h2>
            <span className="text-xs text-slate-400">Sorted by cost efficiency</span>
          </div>
          
          {isLoadingProducts ? (
            <p className="text-xs text-slate-400">Loading products from database...</p>
          ) : products.length === 0 ? (
            <p className="text-xs text-slate-500">No intra-workout products found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const price = product.price_usd || product.price || 0;
                const carbs = product.carbs_per_serving || 1;
                const costPerGram = price > 0 ? (price / carbs).toFixed(2) : 'N/A';

                return (
                  <div key={product.id || product.name} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-200 text-sm">{product.name}</h3>
                      {price > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-emerald-400 border border-slate-700 rounded-full font-mono">
                          ${price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Carbohydrates: <span className="text-emerald-400 font-medium">{product.carbs_per_serving ?? 0}g</span></p>
                      <p>Sodium: <span className="text-sky-400 font-medium">{product.sodium_mg ?? 0}mg</span></p>
                      <div className="pt-2 mt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Cost Efficiency:</span>
                        <span className="text-emerald-400 font-semibold font-mono">${costPerGram} / g carb</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* Slide-over Science Drawer */}
      <ScienceDrawer
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
        activeTags={activeTags}
      />
    </div>
  );
}