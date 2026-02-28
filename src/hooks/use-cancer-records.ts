import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllRecords,
  fetchByDistrict,
  updateRecord,
  deleteRecord,
  insertRecord,
  type CancerRecordInsert,
  type CancerRecordUpdate,
} from '@/lib/cancer-records-api';

export function useCancerRecords() {
  return useQuery({
    queryKey: ['cancer-records'],
    queryFn: fetchAllRecords,
  });
}

export function useCancerRecordsByDistrict(district: string) {
  return useQuery({
    queryKey: ['cancer-records', district],
    queryFn: () => fetchByDistrict(district),
    enabled: !!district,
  });
}

export function useUpdateCancerRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CancerRecordUpdate }) =>
      updateRecord(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cancer-records'] }),
  });
}

export function useDeleteCancerRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecord(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cancer-records'] }),
  });
}

export function useInsertCancerRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (record: CancerRecordInsert) => insertRecord(record),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cancer-records'] }),
  });
}
