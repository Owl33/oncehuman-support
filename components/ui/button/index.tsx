import { Button as UiButton } from "@/components/base/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  children?: ReactNode;
  variant?: any;
}

export const Button = ({ className, size, variant, asChild, children, ...props }: ButtonProps) => {
  return (
    <UiButton
      variant={variant}
      size={size}
      className={cn(className)}
      asChild={asChild}
      {...props}>
      {children}
    </UiButton>
  );
};
