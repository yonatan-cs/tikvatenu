import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-branch/20 bg-cream/50 px-4 py-3 text-sm text-ink",
          "placeholder:text-ink-muted/50",
          "focus:outline-none focus:ring-2 focus:ring-branch/30 focus:border-branch/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
