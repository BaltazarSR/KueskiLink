//src/lib/supabaseUtils.js
export const getPublicUrl = (path) => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/kueskilink/${path}`;
};
