import React from "react";
import { RippleButton } from "./ui/ripple-button";
import { ShimmerButton } from "./ui/shimmer-button";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant: "ripple" | "shimmer";
  type?: "button" | "submit" | "reset";
}

export default function AnimatedButton({
  variant,
  children,
  className,
  type = "button",
  ...buttonProps
}: AnimatedButtonProps) {
  const baseClassName = cn("shadow-2xl py-1 rounded-sm", className);

  switch (variant) {
    case "ripple":
      return (
        <RippleButton className={baseClassName} type={type} {...buttonProps}>
          {children}
        </RippleButton>
      );
    case "shimmer":
      return (
        <ShimmerButton className={baseClassName} type={type} {...buttonProps}>
          {children}
        </ShimmerButton>
      );
    default:
      return (
        <Button className={baseClassName} type={type} {...buttonProps}>
          {children}
        </Button>
      );
  }
}
