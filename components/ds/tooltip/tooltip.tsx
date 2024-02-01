import { Tooltip as NextUiTooltip } from "@nextui-org/react";

import { TTooltip } from "components/ds/tooltip/tooltip.types";

export function Tooltip({ as: Component = "div", children, ...props }: TTooltip.Props) {
  return (
    <NextUiTooltip
      {...props}
      showArrow={true}
      classNames={{
        content: ["p-4 bg-greyscale-800", "od-text-body-s"],
      }}
    >
      <Component>{children}</Component>
    </NextUiTooltip>
  );
}