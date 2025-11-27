export interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: string; // Changed from union type to string to match database schema
  location?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
}

// Type constants for holiday types
export const HOLIDAY_TYPES = {
  PUBLIC: 'Public',
  OPTIONAL: 'Optional'
} as const;
