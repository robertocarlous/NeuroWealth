import { ButtonHTMLAttributes } from "react";

// Spec: primary filled (#0EA5E9 = sky-500), secondary outline, radius 8px (rounded-lg)
type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg shadow-sky-500/20",
  secondary:
    "border border-primary/60 text-primary hover:bg-primary/10 font-medium",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-white/5",
  destructive:
    "bg-error hover:bg-red-400 text-white font-semibold shadow-lg shadow-red-500/20",
};

// Spec: radius 8px = rounded-lg for all sizes
const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3.5 text-base rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 text-center whitespace-normal leading-snug transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
