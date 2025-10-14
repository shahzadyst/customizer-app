import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getStoreByDomain(shopDomain) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('shop_domain', shopDomain)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createOrUpdateStore(shopDomain, accessToken = null) {
  const existing = await getStoreByDomain(shopDomain);

  if (existing) {
    const { data, error } = await supabase
      .from('stores')
      .update({
        updated_at: new Date().toISOString(),
        ...(accessToken && { access_token: accessToken })
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('stores')
      .insert({
        shop_domain: shopDomain,
        access_token: accessToken,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function getStoreOptions(storeId) {
  const [fonts, colors, sizes, usageTypes, acrylicShapes, backboardColors, hangingOptions] = await Promise.all([
    supabase.from('fonts').select('*').eq('store_id', storeId).eq('is_active', true).order('display_order'),
    supabase.from('colors').select('*').eq('store_id', storeId).eq('is_active', true).order('display_order'),
    supabase.from('sizes').select('*').eq('store_id', storeId).eq('is_active', true).order('display_order'),
    supabase.from('usage_types').select('*').eq('store_id', storeId).eq('is_active', true).order('display_order'),
    supabase.from('acrylic_shapes').select('*').eq('store_id', storeId).eq('is_active', true).order('display_order'),
    supabase.from('backboard_colors').select('*').eq('store_id', storeId).eq('is_active', true).order('display_order'),
    supabase.from('hanging_options').select('*').eq('store_id', storeId).eq('is_active', true).order('display_order'),
  ]);

  return {
    fonts: fonts.data || [],
    colors: colors.data || [],
    sizes: sizes.data || [],
    usageTypes: usageTypes.data || [],
    acrylicShapes: acrylicShapes.data || [],
    backboardColors: backboardColors.data || [],
    hangingOptions: hangingOptions.data || [],
  };
}
