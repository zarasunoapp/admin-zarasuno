// Run `npm run types` to regenerate from the live Supabase schema.
// Placeholder kept permissive so the app builds before types are generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = any;
