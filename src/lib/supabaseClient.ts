import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bynsrlomivyrultgxvxp.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_9DBes_2cXnpIzJ8DTTQINQ_JSEilnp9';

export const supabase = createClient(supabaseUrl, supabaseKey);