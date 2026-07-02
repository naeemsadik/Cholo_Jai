import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default" }: { className?: string; variant?: "default" | "mono" }) {
  return (
    <Link
      href="/"
      aria-label="Cholo Jai — Home"
      className={cn(
        "group inline-flex items-center gap-2.5 font-display text-[1.4rem] font-semibold leading-none tracking-tight",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full",
          variant === "mono" ? "bg-paper" : "bg-ink",
        )}
      >
        {/* Tiny editorial mark — concentric circles + a single accent dot */}
        <svg viewBox="0 0 32 32" className="h-full w-full">
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke={variant === "mono" ? "#1A1A1A" : "#FAF7F2"}
            strokeWidth="1.25"
          />
          <circle
            cx="16"
            cy="16"
            r="6"
            fill="none"
            stroke={variant === "mono" ? "#1A1A1A" : "#FAF7F2"}
            strokeWidth="1.25"
          />
          <circle
            cx="16"
            cy="16"
            r="2"
            fill={variant === "mono" ? "#006A4E" : "#FAF7F2"}
          />
        </svg>
      </span>
      <span className="flex items-baseline gap-1">
        <span>Cholo</span>
        <span className="font-display italic">Jai</span>
      </span>
    </Link>
  );
}