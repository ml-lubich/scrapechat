export default function ChatLoading() {
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

      {/* Message area skeleton */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* User message */}
            <div className="flex justify-end gap-3">
              <div className="h-12 w-48 animate-pulse rounded-2xl rounded-br-md bg-violet-600/20" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--secondary)]" />
            </div>
            {/* Assistant message */}
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-violet-600/20" />
              <div className="space-y-3 flex-1 max-w-[80%]">
                <div className="h-16 animate-pulse rounded-2xl rounded-bl-md bg-[var(--secondary)]" />
                <div className="h-32 animate-pulse rounded-lg bg-[var(--secondary)]" />
              </div>
            </div>
            {/* Another user message */}
            <div className="flex justify-end gap-3">
              <div className="h-12 w-64 animate-pulse rounded-2xl rounded-br-md bg-violet-600/20" />
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--secondary)]" />
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="mx-auto max-w-3xl">
            <div className="h-12 animate-pulse rounded-xl bg-[var(--secondary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
