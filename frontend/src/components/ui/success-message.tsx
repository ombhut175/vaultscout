import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./alert";

interface SuccessMessageProps {
  title?: string;
  message: string;
  className?: string;
}

/**
 * Inline success message component
 * Displays success messages with appropriate styling
 */
export function SuccessMessage({ 
  title,
  message, 
  className
}: SuccessMessageProps) {
  return (
    <Alert className={cn("border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600", className)}>
      <CheckCircle2 className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/**
 * Success card for full page success states
 */
export function SuccessCard({ 
  title = "Success!",
  message,
  action,
  className
}: {
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-[400px] items-center justify-center p-8", className)}>
      <div className="max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}

/**
 * Helper function to show success toast
 * Uses sonner toast library
 */
export function showSuccessToast(_message: string, _options?: { title?: string; duration?: number }) {
  // This will be imported from sonner in the consuming component
  // toast.success(_options?.title || "Success", { description: _message, duration: _options?.duration });
}
