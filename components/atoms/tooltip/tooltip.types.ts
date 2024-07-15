import { ComponentPropsWithoutRef, ElementType, PropsWithChildren, ReactNode } from "react";

interface ClassNames {
  base: string;
}

export interface TooltipPort<C extends ElementType> extends PropsWithChildren {
  as?: C;
  htmlProps?: ComponentPropsWithoutRef<C>;
  classNames?: Partial<ClassNames>;
  enabled?: boolean;
  canInteract?: boolean;
  content: ReactNode;
}
