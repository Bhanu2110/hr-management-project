import { Holiday } from "../types/holidays";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Mock holidays - kept for reference but not used for fetching
const mockHolidays: Holiday[] = [
  {
    id: "1",
    name: "New Year's Day",
    date: "2023-01-01",
    day: "Sunday",
    type: "Public",
    location: "New York",
  },
];

// Holiday service with CRUD operations
export const holidayService = {
  // Get all holidays with optional filtering - Returns empty array on error for better UX
  async fetchHolidays(year: string, location: string = "All"): Promise<Holiday[]> {
    try {
      console.log('=== FETCH HOLIDAYS DEBUG ===');
      console.log('Fetching holidays for year:', year, 'and location:', location);

      // Fetch from Supabase
      let query = supabase
        .from('holidays')
        .select('*');

      if (year) {
        // Filter by year using date range (gte and lt) instead of LIKE
        const startDate = `${year}-01-01`;
        const endDate = `${parseInt(year) + 1}-01-01`;
        console.log('Applying year filter - start:', startDate, 'end:', endDate);
        query = query.gte('date', startDate).lt('date', endDate);
      }

      if (location && location !== "All") {
        console.log('Applying location filter:', location);
        query = query.eq('location', location);
      }

      console.log('Executing query...');
      const { data, error } = await query.order('date', { ascending: true });

      console.log('Query completed');
      console.log('Error:', error);
      console.log('Raw data from Supabase:', data);
      console.log('Data length:', data?.length || 0);

      if (error) {
        console.error('Error fetching holidays:', error);
        console.log('Returning empty array due to fetch error');
        console.log('=== END FETCH DEBUG ===');
        return []; // Return empty array instead of throwing
      }

      if (data && data.length > 0) {
        console.log('Found', data.length, 'holidays in database');
        const mappedData = data.map((holiday: any) => ({
          ...holiday,
          day: format(new Date(holiday.date), 'EEEE') // Calculate day of week from date
        }));
        console.log('Mapped data:', mappedData);
        console.log('=== END FETCH DEBUG ===');
        return mappedData;
      }

      // Return empty array if no holidays found
      console.log('No holidays found in database');
      console.log('=== END FETCH DEBUG ===');
      return [];
    } catch (error: any) {
      console.error('Error in fetchHolidays:', error);
      console.log('Returning empty array due to exception');
      console.log('=== END FETCH DEBUG ===');
      return []; // Return empty array instead of throwing
    }
  },

  // Create a new holiday - DO NOT send created_by to avoid foreign key errors
  async createHoliday(holiday: Omit<Holiday, 'id' | 'day' | 'created_at' | 'updated_at'>): Promise<Holiday> {
    console.log('=== CREATE HOLIDAY DEBUG ===');
    console.log('Input holiday:', JSON.stringify(holiday, null, 2));

    const day = format(new Date(holiday.date), 'EEEE');

    // Only send the required fields - DO NOT send created_by
    // The created_by field has a foreign key constraint to the employees table
    const holidayData: any = {
      name: holiday.name,
      date: holiday.date,
      day: day,
      type: holiday.type,
    };

    // Only add location if it has a value
    if (holiday.location) {
      holidayData.location = holiday.location;
    }

    console.log('Sending to Supabase:', JSON.stringify(holidayData, null, 2));

    const { data, error } = await supabase
      .from('holidays')
      .insert(holidayData)
      .select()
      .single();

    if (error) {
      console.error('=== SUPABASE ERROR ===');
      console.error('Error object:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      throw new Error(`Failed to create holiday: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create holiday: No data returned from database');
    }

    console.log('Successfully created holiday:', data);
    console.log('=== END DEBUG ===');
    return data;
  },

  // Update an existing holiday
  async updateHoliday(id: string, updates: Partial<Omit<Holiday, 'id' | 'created_at'>>): Promise<Holiday> {
    console.log('Updating holiday with ID:', id, 'and updates:', updates);
    const updateData: any = {};

    // Only include fields that are being updated
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.date !== undefined) {
      updateData.date = updates.date;
      updateData.day = format(new Date(updates.date), 'EEEE');
    }
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.location !== undefined) updateData.location = updates.location;
    // DO NOT update created_by to avoid foreign key issues

    const { data, error } = await supabase
      .from('holidays')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating holiday:', error);
      throw new Error(`Failed to update holiday: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update holiday: No data returned from database');
    }

    console.log('Successfully updated holiday:', data);
    return data;
  },

  // Delete a holiday
  async deleteHoliday(id: string): Promise<boolean> {
    console.log('Deleting holiday with ID:', id);

    const { error } = await supabase
      .from('holidays')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting holiday:', error);
      throw new Error(`Failed to delete holiday: ${error.message}`);
    }

    console.log('Successfully deleted holiday with ID:', id);
    return true;
  },

  // Get a single holiday by ID
  async getHolidayById(id: string): Promise<Holiday | null> {
    console.log('Getting holiday by ID:', id);

    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching holiday by ID:', error);
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      throw new Error(`Failed to fetch holiday: ${error.message}`);
    }

    console.log('Found holiday:', data);
    return data;
  },

  // Helper method to get mock holidays (kept for reference, not used)
  getMockHolidays(year: string, location: string = "All"): Holiday[] {
    let holidaysToReturn = mockHolidays.filter(holiday => holiday.date.startsWith(year));

    if (location !== "All") {
      holidaysToReturn = holidaysToReturn.filter(holiday => holiday.location === location);
    }

    return holidaysToReturn;
  }
};

// Legacy function for backward compatibility
export const fetchHolidays = async (year: string, location: string): Promise<Holiday[]> => {
  return holidayService.fetchHolidays(year, location);
};
