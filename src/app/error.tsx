"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        An error occurred. You can try again or go back.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
      <Button variant="outline" asChild>
        <a href="/">Go home</a>
      </Button>
    </div>
  );
}
