import { supabase } from './supabaseClient';

export async function fetchProductsByTiming(timing: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('timing', timing);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export async function updateUserProfile(userId: string, bodyMassKg: number, vdot: number) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      body_mass_kg: bodyMassKg,
      vdot: vdot,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
}

export async function logWorkoutSession(sessionData: {
  user_id: string;
  session_name: string;
  duration_minutes: number;
  intensity_zone: string;
  session_type: string;
  is_periodized_block: boolean;
}) {
  const { data, error } = await supabase
    .from('workouts')
    .insert([sessionData]);

  if (error) {
    console.error('Error logging workout session:', error);
    throw error;
  }
  return data;
}