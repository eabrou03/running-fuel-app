import { supabase } from './supabaseClient';
import { VdotZone } from './vdotEngine';

export interface ProfileRecord {
  id: string;
  body_mass_kg: number;
  vdot_score: number;
  default_sweat_rate_lph: number;
}

export interface WorkoutRecord {
  id?: string;
  user_id: string;
  session_name: string;
  duration_minutes: number;
  intensity_zone: VdotZone;
  session_type: string;
  is_periodized_block: boolean;
}

export interface ProductRecord {
  id: string;
  name: string;
  brand?: string;
  category: 'raw_powder' | 'commercial_gel' | 'candy' | 'whole_food';
  recommended_timing: 'pre_workout' | 'intra_workout' | 'post_workout' | 'anytime';
  digestion_time_mins: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
  sodium_mg: number;
  potassium_mg: number;
  magnesium_mg: number;
  upfront_cost_usd: number;
  total_servings: number;
  purchase_link?: string;
}

/**
 * Fetch products from Supabase based on timing window
 */
export async function fetchProductsByTiming(
  timing: 'pre_workout' | 'intra_workout' | 'post_workout'
): Promise<ProductRecord[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`recommended_timing.eq.${timing},recommended_timing.eq.anytime`);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as ProductRecord[];
}

/**
 * Save or update athlete profile data
 */
export async function updateUserProfile(
  userId: string,
  bodyMassKg: number,
  vdotScore: number
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      body_mass_kg: bodyMassKg,
      vdot_score: vdotScore,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
  return true;
}

/**
 * Log a planned or completed workout session
 */
export async function logWorkoutSession(workout: WorkoutRecord): Promise<string | null> {
  const { data, error } = await supabase
    .from('workouts')
    .insert([workout])
    .select('id')
    .single();

  if (error) {
    console.error('Error logging workout:', error);
    return null;
  }
  return data.id;
}