export default function SettingsLoading() {
  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar skeleton */}
      <div className="hidden w-64 border-r border-[var(--border)] p-4 md:block">
        <div className="mb-6 h-10 w-full animate-pulse rounded-lg bg-[var(--secondary)]" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-lg bg-[var(--secondary)]"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      </div>

      {/* Settings skeleton */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-[var(--secondary)]" />
            <div className="mt-3 h-5 w-64 animate-pulse rounded-lg bg-[var(--secondary)]" />
          </div>

          <div className="space-y-6">
            {/* Plan card skeleton */}
            <div className="rounded-xl border border-[var(--border)] p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-5 w-28 animate-pulse rounded bg-[var(--secondary)]" />
                <div className="h-4 w-48 animate-pulse rounded bg-[var(--secondary)]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-7 w-14 animate-pulse rounded-full bg-[var(--secondary)]" />
                <div className="h-4 w-32 animate-pulse rounded bg-[var(--secondary)]" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-28 animate-pulse rounded bg-[var(--secondary)]" />
                  <div className="h-4 w-24 animate-pulse rounded bg-[var(--secondary)]" />
                </div>
                <div className="h-2 w-full animate-pulse rounded-full bg-[var(--secondary)]" />
              </div>
              <div className="h-10 w-full animate-pulse rounded-md bg-[var(--secondary)]" />
            </div>

            {/* Account card skeleton */}
            <div className="rounded-xl border border-[var(--border)] p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-5 w-20 animate-pulse rounded bg-[var(--secondary)]" />
                <div className="h-4 w-40 animate-pulse rounded bg-[var(--secondary)]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-12 animate-pulse rounded bg-[var(--secondary)]" />
                  <div className="h-4 w-40 animate-pulse rounded bg-[var(--secondary)]" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-12 animate-pulse rounded bg-[var(--secondary)]" />
                  <div className="h-4 w-32 animate-pulse rounded bg-[var(--secondary)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
