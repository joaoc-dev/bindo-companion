import { createSession } from '@bindo/api-client/api/generated/companion/sessions/sessions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Dice5, Loader2, LogIn, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSessionSchema } from '@/lib/schemas';

const SESSION_PATH_RE = /\/session\/([a-f0-9-]+)/i;
const SESSION_ID_RE = /^[a-f0-9-]{36}$/i;

interface CreateSessionForm {
  name: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [joinMode, setJoinMode] = useState(false);
  const [sessionUrl, setSessionUrl] = useState('');

  const form = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: { name: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSessionForm) => createSession({ name: data.name }),
    onSuccess: (res) => {
      if (res.status === 201) {
        setDialogOpen(false);
        form.reset();
        void navigate({ to: '/session/$sessionId', params: { sessionId: res.data.id } });
      }
    },
    onError: () => {
      toast.error('Failed to create session');
    },
  });

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = new URL(sessionUrl, window.location.origin);
      const match = url.pathname.match(SESSION_PATH_RE);
      if (match?.[1]) {
        void navigate({ to: '/session/$sessionId', params: { sessionId: match[1] } });
        return;
      }
    }
    catch {
      // not a URL, try as raw ID
    }

    const trimmed = sessionUrl.trim();
    if (SESSION_ID_RE.test(trimmed)) {
      void navigate({ to: '/session/$sessionId', params: { sessionId: trimmed } });
      return;
    }

    toast.error('Enter a valid session link or ID');
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Dice5 className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Bindo Companion</h1>
          <p className="text-muted-foreground">Your board game score tracker</p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="lg" className="w-full gap-2 text-base" />}>
              <Plus className="size-4" />
              Create Session
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Game Session</DialogTitle>
                <DialogDescription>
                  Give your session a name so players can recognize it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(data => createMutation.mutate(data))}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-name">Session Name</Label>
                    <Input
                      id="session-name"
                      placeholder="Game Night at Mike's"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                    {createMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {!joinMode
            ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 text-base"
                  onClick={() => setJoinMode(true)}
                >
                  <LogIn className="size-4" />
                  Join Session
                </Button>
              )
            : (
                <Card>
                  <CardContent className="pt-4">
                    <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="session-url">Session Link or ID</Label>
                        <Input
                          id="session-url"
                          placeholder="Paste session link or ID"
                          value={sessionUrl}
                          onChange={e => setSessionUrl(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1 gap-2">
                          <LogIn className="size-4" />
                          Join
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setJoinMode(false);
                            setSessionUrl('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
        </div>
      </div>
    </div>
  );
}
