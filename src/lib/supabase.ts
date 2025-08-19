import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lismbspafdvxtrhvycti.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpc21ic3BhZmR2eHRyaHZ5Y3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTYxNjMsImV4cCI6MjA3MTE3MjE2M30.LH-K2dUASvVxFeQ6cWSlkx__l27elwJwiB_vqdk2gFc'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables, using fallback values')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          name: string
          total_amount: number
          start_date: string
          end_date: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          total_amount: number
          start_date: string
          end_date: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          total_amount?: number
          start_date?: string
          end_date?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          description: string | null
          quantity: number
          unit_price: number
          category: string
          brand: string
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          quantity: number
          unit_price: number
          category: string
          brand: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          quantity?: number
          unit_price?: number
          category?: string
          brand?: string
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
