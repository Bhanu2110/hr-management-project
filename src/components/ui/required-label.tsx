import * as React from "react";
import { FormLabel } from "@/components/ui/form";

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const RequiredLabel = ({ children, required = true, className }: RequiredLabelProps) => {
  return (
    <FormLabel className={className}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </FormLabel>
  );
};
