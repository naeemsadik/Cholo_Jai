import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, variant = "default" }: { className?: string; variant?: "default" | "mono" }) {
  return (
    <Link
      href="/"
      aria-label="Ghurighuri — Home"
      className={cn(
        "group inline-flex items-center gap-2.5 font-display text-[1.4rem] font-semibold leading-none tracking-tight",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full",
          variant === "mono" ? "bg-paper ring-1 ring-rule" : "bg-ink",
        )}
      >
        {/* Editorial mark — concentric circles + a single brand-orange dot.
            Evokes a friendly eye / "where to next?" wanderer's mark. */}
        <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden>
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
            r="2.25"
            fill={variant === "mono" ? "#F97316" : "#FACC15"}
          />
        </svg>
      </span>
      <span className="flex items-baseline gap-0.5">
        <span className="font-display tracking-tight">Ghuri</span>
        <span className="font-display italic tracking-tight text-orange-500">ghuri</span>
      </span>
    </Link>
  );
}