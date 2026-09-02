// Types & Interfaces
export type VdotZone = 'E' | 'M' | 'T' | 'I' | 'R';

export interface FuelingTarget {
  preWorkout: {
    carbsGrams: number;
    timingWindowMins: number;
    recommendedFoods: string[];
  };
  intraWorkout: {
    carbsPerHrGrams: number;
    fluidPerHrMl: number;
    sodiumPerHrMg: number;
    potassiumPerHrMg: number;
    magnesiumPerHrMg: number;
    chloridePerHrMg: number;
    carbRatio: string; // e.g., "1:0.8 Maltodextrin to Fructose"
  };
  postWorkout: {
    carbsGrams: number;
    proteinGrams: number;
    leucineTargetGrams: number;
    fluidReplacementPct: number; // e.g., 125-150% of fluid lost
  };
  ergogenicSupplements: {
    name: string;
    dosage: string;
    timing: string;
  }[];
}

/**
 * Calculates Jack Daniels' VDOT score from race distance and finish time.
 * @param distanceMeters Distance in meters (e.g., 5000 for 5k)
 * @param timeSeconds Time in seconds (e.g., 1200 for 20:00)
 */
export function calculateVDOT(distanceMeters: number, timeSeconds: number): number {
  const timeMinutes = timeSeconds / 60;
  const velocityMPerMin = distanceMeters / timeMinutes;

  // Oxygen cost formula: VO2 = -4.60 + 0.182258 * V + 0.000104 * V^2
  const vo2Cost = -4.60 + 0.182258 * velocityMPerMin + 0.000104 * Math.pow(velocityMPerMin, 2);

  // Sustainable fraction of VO2 max: %VO2max = 0.8 + 0.1894393 * e^(-0.012778 * t) + 0.2989558 * e^(-0.1932605 * t)
  const percentVo2Max =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * timeMinutes) +
    0.2989558 * Math.exp(-0.1932605 * timeMinutes);

  const vdot = vo2Cost / percentVo2Max;
  return Math.round(vdot * 10) / 10; // Round to 1 decimal place
}

/**
 * Fueling Decision Engine mapping duration, intensity zone, and weight to macronutrient/micronutrient targets.
 */
export function calculateFuelingRequirements(
  durationMinutes: number,
  intensityZone: VdotZone,
  bodyMassKg: number,
  defaultSweatRateLph: number = 1.2
): FuelingTarget {
  const isHighIntensity = ['T', 'I', 'R'].includes(intensityZone);
  const hourlyFluid = defaultSweatRateLph * 1000; // in mL

  // 1. Intra-workout Carbohydrate & Micronutrient Tiers
  let carbsPerHr = 0;
  let sodiumPerHr = 0;
  let potassiumPerHr = 0;
  let magnesiumPerHr = 0;
  let chloridePerHr = 0;
  let carbRatio = 'N/A';

  if (durationMinutes >= 90) {
    carbsPerHr = 60; // 60-90g/hr target
    sodiumPerHr = 600; // mg/hr
    potassiumPerHr = 200; // mg/hr
    magnesiumPerHr = 40; // mg/hr
    chloridePerHr = 800; // mg/hr
    carbRatio = '1:0.8 Maltodextrin to Fructose';
  } else if (durationMinutes >= 45 || isHighIntensity) {
    carbsPerHr = 30;
    sodiumPerHr = 400;
    potassiumPerHr = 100;
    magnesiumPerHr = 20;
    chloridePerHr = 500;
    carbRatio = 'Glucose / Sucrose Blend';
  }

  // 2. Pre-Workout Fueling
  const preCarbs = durationMinutes >= 60 ? Math.round(1.0 * bodyMassKg) : 30;
  const preWindow = durationMinutes >= 60 ? 90 : 30;
  const recommendedPreFoods =
    preWindow >= 90
      ? ['Oatmeal with Honey', 'Rice Cakes with Jam', 'Bagel with Peanut Butter']
      : ['GoGo SqueeZ Applesauce', 'Banana', '5x Swedish Fish'];

  // 3. Ergogenic Supplements Logic
  const supplements = [];
  if (isHighIntensity) {
    supplements.push({
      name: 'Sodium Bicarbonate',
      dosage: `${(0.3 * bodyMassKg).toFixed(1)}g`,
      timing: '120-180 mins pre-session (taken with 10ml/kg water)',
    });
  }
  if (durationMinutes >= 60 || isHighIntensity) {
    supplements.push({
      name: 'Caffeine Anhydrous',
      dosage: `${(3 * bodyMassKg).toFixed(0)}mg - ${(6 * bodyMassKg).toFixed(0)}mg`,
      timing: '45-60 mins pre-session',
    });
  }

  return {
    preWorkout: {
      carbsGrams: preCarbs,
      timingWindowMins: preWindow,
      recommendedFoods: recommendedPreFoods,
    },
    intraWorkout: {
      carbsPerHrGrams: carbsPerHr,
      fluidPerHrMl: durationMinutes >= 45 ? hourlyFluid : 0,
      sodiumPerHrMg: sodiumPerHr,
      potassiumPerHrMg: potassiumPerHr,
      magnesiumPerHrMg: magnesiumPerHr,
      chloridePerHrMg: chloridePerHr,
      carbRatio: carbRatio,
    },
    postWorkout: {
      carbsGrams: Math.round(1.2 * bodyMassKg),
      proteinGrams: Math.min(Math.round(0.4 * bodyMassKg), 40),
      leucineTargetGrams: 3.0,
      fluidReplacementPct: 150,
    },
    ergogenicSupplements: supplements,
  };
}