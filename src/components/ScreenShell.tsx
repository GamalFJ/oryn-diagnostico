import type { ReactNode } from "react";

export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative z-10 flex min-h-[100dvh] w-full justify-center px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-[480px] flex-col gap-8">{children}</div>
    </main>
  );
}
