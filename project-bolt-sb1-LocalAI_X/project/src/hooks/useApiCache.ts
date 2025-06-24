// Create src/hooks/useApiCache.ts:
import { useQuery } from '@tanstack/react-query';

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => fetch('/v1/models').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}