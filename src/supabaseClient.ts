
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://afkfbhdcsqgzrqpixsaw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFma2ZiaGRjc3FnenJxcGl4c2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDYzNjksImV4cCI6MjA4MTQyMjM2OX0.53JAXiMZuBeAk1r5jiorOQOcCLOLHiZgGP7iI0BhGik';

// Inicializa e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
