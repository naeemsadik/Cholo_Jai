"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring select-none",
  {
    variants: {
      variant: {
        // Editorial — solid ink, the workhorse CTA on light bg
        primary:
          "bg-ink text-paper hover:bg-ink-700 active:bg-ink-900 shadow-paper",
        // Subtle — secondary action
        secondary:
          "bg-cream-200 text-ink hover:bg-cream-300 border border-rule",
        // Outline — ghost button with hairline border
        outline:
          "border border-rule bg-transparent text-ink hover:bg-cream-100 hover:border-ink-300",
        // Ghost — text only
        ghost: "bg-transparent text-ink hover:bg-cream-100",
        // Outbound — reserved for the primary "Go to event" CTA. Ember-red, used sparingly.
        outbound:
          "bg-ember text-paper hover:bg-ember-600 active:bg-ember-700 shadow-paper",
        // Link — minimal text button with editorial underline
        link: "text-ink underline-offset-4 hover:underline p-0 h-auto",
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-md",
        md: "h-11 px-5 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-md",
        xl: "h-14 px-8 text-base rounded-md",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };