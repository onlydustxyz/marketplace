import classNames from "classnames";
import { PropsWithChildren } from "react";

export enum ButtonSize {
  Xs = "xs",
  Sm = "sm",
  Md = "md",
  LgLowHeight = "lg-low-height",
  Lg = "lg",
}

export enum ButtonType {
  Primary = "primary",
  Secondary = "secondary",
  Ternary = "ternary",
}

export enum Width {
  Full = "full",
  Fit = "fit",
}

type ButtonProps = {
  size?: ButtonSize;
  type?: ButtonType;
  htmlType?: "button" | "submit";
  width?: Width;
  disabled?: boolean;
  iconOnly?: boolean;
  [otherProp: string]: unknown;
} & PropsWithChildren;

export default function Button({
  size = ButtonSize.Lg,
  type = ButtonType.Primary,
  width = Width.Fit,
  disabled = false,
  htmlType = "button",
  iconOnly = false,
  children,
  ...otherButtonProps
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "flex flex-row justify-center items-center",
        "font-walsheim drop-shadow-bottom-sm font-medium",
        {
          "cursor-pointer": !disabled,
          "cursor-not-allowed": disabled,
        },
        {
          "hover:shadow-none": !disabled,
        },
        {
          "shadow-bottom-sm": type === ButtonType.Primary,
          "drop-shadow-bottom-sm": type === ButtonType.Secondary,
        },
        {
          "w-full": width === Width.Full,
          "w-fit": width === Width.Fit,
        },
        {
          "h-14 gap-3 rounded-xl": size === ButtonSize.Lg,
          "h-12 gap-3 rounded-xl": size === ButtonSize.LgLowHeight,
          "text-sm h-14 gap-2 rounded-xl": size === ButtonSize.Md,
          "text-sm h-8 gap-2 rounded-large": size === ButtonSize.Sm,
          "text-xs h-6 gap-1 rounded-lg": size === ButtonSize.Xs,
        },
        {
          "px-6 py-4": size === ButtonSize.Lg && !iconOnly,
          "p-4": size === ButtonSize.Lg && iconOnly,
          "px-4 py-1.5": size === (ButtonSize.LgLowHeight || ButtonSize.Md) && !iconOnly,
          "p-3.5": size === (ButtonSize.LgLowHeight || ButtonSize.Md) && iconOnly,
          "px-4 py-2": size === ButtonSize.Sm && !iconOnly,
          "p-2": size === ButtonSize.Sm && iconOnly,
          "px-2 py-1": size === ButtonSize.Xs && !iconOnly,
          "p-1": size === ButtonSize.Xs && iconOnly,
        },
        {
          "bg-greyscale-50": type === ButtonType.Primary,
          "bg-white/5 backdrop-blur-lg border": type === ButtonType.Secondary,
        },
        {
          "text-spaceBlue-900": type === ButtonType.Primary && !disabled,
          "text-greyscale-50": type === ButtonType.Secondary && !disabled,
          "text-spacePurple-500": type === ButtonType.Ternary && !disabled,
          "text-spaceBlue-500": (type === ButtonType.Primary || type === ButtonType.Secondary) && disabled,
          "text-greyscale-600": type === ButtonType.Ternary && disabled,
        },
        {
          "bg-spaceBlue-800": (type === ButtonType.Primary || type === ButtonType.Secondary) && disabled,
          "border-spaceBlue-500": type === ButtonType.Secondary && disabled,
        },
        {
          "hover:text-spacePurple-900 hover:outline hover:outline-4 hover:outline-spacePurple-800 hover:bg-spacePurple-50":
            type === ButtonType.Primary && !disabled,
          "hover:text-spacePurple-400 hover:bg-spacePurple-900 hover:border-spacePurple-400":
            type === ButtonType.Secondary && !disabled,
          "hover:text-spacePurple-400 hover:bg-spacePurple-900": type === ButtonType.Ternary && !disabled,
        }
      )}
      type={htmlType}
      disabled={disabled}
      {...otherButtonProps}
    >
      {children}
    </button>
  );
}
