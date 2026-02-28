import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type CancerRecord = Tables<'cancer_records'>;
export type CancerRecordInsert = TablesInsert<'cancer_records'>;
export type CancerRecordUpdate = TablesUpdate<'cancer_records'>;

const getSupabase = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  return supabase;
};

// Fetch all records
export async function fetchAllRecords(): Promise<CancerRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('cancer_records')
    .select('*')
    .order('district');
  if (error) throw error;
  return data ?? [];
}

// Fetch by district
export async function fetchByDistrict(district: string): Promise<CancerRecord[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('cancer_records')
    .select('*')
    .eq('district', district);
  if (error) throw error;
  return data ?? [];
}

// Update a record
export async function updateRecord(id: string, updates: CancerRecordUpdate): Promise<CancerRecord> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('cancer_records')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Record not found');
  return data;
}

// Delete a record
export async function deleteRecord(id: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from('cancer_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Insert a record
export async function insertRecord(record: CancerRecordInsert): Promise<CancerRecord> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('cancer_records')
    .insert(record)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Insert failed');
  return data;
}
