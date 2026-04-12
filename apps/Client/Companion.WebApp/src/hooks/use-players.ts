import { createPlayer } from '@bindo/api-client/api/generated/companion/players/players';
import { useMutation } from '@tanstack/react-query';

export interface LocalPlayer {
  id: string;
  displayName: string;
}

export function useCreatePlayer() {
  return useMutation({
    mutationFn: async (displayName: string): Promise<LocalPlayer> => {
      const res = await createPlayer({ displayName });
      return { id: res.data.id, displayName };
    },
  });
}
