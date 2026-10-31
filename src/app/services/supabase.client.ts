
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhawopucdgqaoqlvlvcv.supabase.co';
const supabaseKey = 'sb_publishable_VrRoryyER8AK2xLf5DzZvQ_CF5431fq';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
