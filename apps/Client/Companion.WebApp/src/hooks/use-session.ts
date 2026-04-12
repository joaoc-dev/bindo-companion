import { createSession, getSession } from '@bindo/api-client/api/generated/companion/sessions/sessions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export const sessionKeys = {
  all: ['sessions'] as const,
  detail: (id: string) => [...sessionKeys.all, id] as const,
};

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: async () => {
      const res = await getSession(sessionId);
      if (res.status === 404) {
        throw new Error('Session not found');
      }
      return res.data;
    },
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: (name: string) => createSession({ name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}
