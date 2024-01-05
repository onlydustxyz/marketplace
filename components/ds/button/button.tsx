import { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";
import { cn } from "src/utils/cn";
import { ButtonVariants } from "./variants/button.variants";
import { buttonPrimaryVariants } from "./variants/button-primary.variants";
import { buttonSecondaryVariants } from "./variants/button-secondary.variants";
import { buttonTertiaryVariants } from "./variants/button-tertiary.variants";

type HtmlButton = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;
interface ButtonProps extends PropsWithChildren, ButtonVariants, HtmlButton {
  onClick: () => void;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  className?: string;
}

export const Button: FC<ButtonProps> = ({ htmlType = "button", className, children, ...props }) => {
  const { type = "primary", disabled } = props;

  return (
    <button
      className={cn(
        type === "primary" && buttonPrimaryVariants({ ...props }),
        type === "secondary" && buttonSecondaryVariants({ ...props }),
        type === "tertiary" && buttonTertiaryVariants({ ...props }),
        className
      )}
      disabled={disabled}
      {...props}
      type={htmlType}
    >
      {children}
    </button>
  );
};
