export default function RecipesLoading() {
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

      {/* Recipe grid skeleton */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="h-9 w-48 animate-pulse rounded-lg bg-[var(--secondary)]" />
            <div className="mt-3 h-5 w-80 animate-pulse rounded-lg bg-[var(--secondary)]" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] p-6 space-y-4"
              >
                <div className="space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--secondary)]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[var(--secondary)]" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 animate-pulse rounded bg-[var(--secondary)]" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 animate-pulse rounded-md bg-[var(--secondary)]" />
                    <div className="h-8 w-8 animate-pulse rounded-md bg-[var(--secondary)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
