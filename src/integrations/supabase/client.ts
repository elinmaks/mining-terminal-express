// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ahxmaqdwdfhuvezizngh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoeG1hcWR3ZGZodXZleml6bmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NjQ5MTEsImV4cCI6MjA1NjU0MDkxMX0.v3HIuLmo9sGj4F6H6-L_ncbC9In-Q2bXhq1ruVsEFyM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);