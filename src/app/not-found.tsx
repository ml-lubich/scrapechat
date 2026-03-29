import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-6xl font-extrabold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
