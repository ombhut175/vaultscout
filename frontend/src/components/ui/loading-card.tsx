import { Card, CardContent, CardHeader } from "./card";
import { Skeleton } from "./skeleton";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  variant?: "skeleton" | "spinner";
  className?: string;
  text?: string;
}

/**
 * Loading card component with skeleton or spinner variants
 */
export function LoadingCard({ 
  variant = "skeleton", 
  className,
  text 
}: LoadingCardProps) {
  if (variant === "spinner") {
    return (
      <Card className={cn("p-8", className)}>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          {text && (
            <p className="text-sm text-muted-foreground">{text}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </CardContent>
    </Card>
  );
}

/**
 * Loading card list - shows multiple loading cards
 */
export function LoadingCardList({ 
  count = 3, 
  className 
}: { 
  count?: number; 
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
