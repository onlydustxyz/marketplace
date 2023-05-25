import classNames from "classnames";
import { PropsWithChildren } from "react";

export enum TagSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

export enum TagBorderColor {
  Grey = "grey",
  MultiColor = "multi-color",
}

export type TagProps = {
  id?: string;
  size: TagSize;
  borderColor?: TagBorderColor;
  testid?: string;
  opaque?: boolean;
} & PropsWithChildren;

export default function Tag({
  id,
  size,
  borderColor = TagBorderColor.Grey,
  testid,
  opaque,
  children,
  ...rest
}: TagProps) {
  return (
    <div data-testid={testid} id={id} className="w-fit rounded-full p-px overflow-hidden shrink-0" {...rest}>
      <div
        className={classNames(
          "flex items-center justify-center w-fit gap-1 rounded-full font-walsheim font-normal text-white relative h-7",
          "before:absolute before:h-screen before:w-screen before:-z-10",
          {
            "py-1 px-2 text-xs": size === TagSize.Small,
            "py-1.5 px-3 text-sm": size === TagSize.Medium,
            "py-2 px-4 text-sm": size === TagSize.Large,
          },
          {
            "border border-greyscale-50/8": borderColor === TagBorderColor.Grey,
            "before:bg-multi-color-gradient before:animate-spin-invert-slow": borderColor === TagBorderColor.MultiColor,
          },
          {
            "bg-spaceBlue-900": borderColor === TagBorderColor.MultiColor || opaque,
            "bg-white/2": borderColor === TagBorderColor.Grey && !opaque,
          }
        )}
      >
        {children}
      </div>
    </div>
  );
}
