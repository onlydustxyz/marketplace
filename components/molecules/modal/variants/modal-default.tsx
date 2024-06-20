import { ModalNextUiAdapter } from "components/molecules/modal/adapters/next-ui/next-ui.adapter";

import { ModalCore } from "../modal.core";
import { ModalPort } from "../modal.types";

export function Modal({ titleProps, closeButtonProps, ...props }: ModalPort) {
  return (
    <ModalCore
      Adapter={ModalNextUiAdapter}
      {...props}
      classNames={{
        modal: "bg-container-2 border border-container-stroke-separator",
        footer: "border-t border-container-stroke-separator",
      }}
      titleProps={{
        variant: "branding",
        size: "xl",
        as: "h6",
        ...titleProps,
      }}
      closeButtonProps={{
        variant: "secondary-light",
        size: "l",
        ...closeButtonProps,
      }}
    />
  );
}