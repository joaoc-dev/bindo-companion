import { Link, Outlet } from '@tanstack/react-router';
import { Dice5 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 text-primary transition-colors hover:text-primary/80">
            <Dice5 className="size-6" />
            <span className="text-lg font-bold tracking-tight">Bindo</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}
