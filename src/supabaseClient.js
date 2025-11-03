// src/supabaseClient.js

// Import the Supabase client library from the CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Your Supabase project's URL and anon key
const supabaseUrl = 'https://zprzonrcuskyeseekjjn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwcnpvbnJjdXNreWVzZWVrampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTg5NDAsImV4cCI6MjA3Nzc3NDk0MH0.lwXqkVYvbyZ4D9S8ZyZqGuavq0R0lrtsD2o1KclDfzo';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
