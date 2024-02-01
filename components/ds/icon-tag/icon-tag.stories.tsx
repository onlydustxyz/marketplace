import { Meta, StoryObj } from "@storybook/react";

import { IconTag } from "components/ds/icon-tag/icon-tag";
import { TIconTag } from "components/ds/icon-tag/icon-tag.types";

const defaultProps: TIconTag.Props = {
  remixName: "ri-seedling-line",
  active: false,
};

const activeProps: TIconTag.Props = {
  remixName: "ri-rocket-2-line",
  active: true,
};

const tooltipProps: TIconTag.Props = {
  remixName: "ri-hand-coin-line",
  tooltipContent: "Tooltip content",
};

const meta: Meta<typeof IconTag> = {
  component: IconTag,
  title: "Design system/IconTag",
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "black",
      values: [{ name: "black", value: "#0E0814" }],
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconTag>;

export const Default: Story = {
  render: () => {
    return (
      <div className="flex flex-row gap-4">
        <IconTag {...defaultProps} />
        <IconTag {...defaultProps} remixName="ri-hand-coin-line" active />
        <IconTag {...defaultProps} remixName="ri-git-fork-line" tooltipContent="Tooltip content" />
      </div>
    );
  },
};

export const ActiveIconTag: Story = {
  render: () => {
    return <IconTag {...activeProps} />;
  },
};

export const TooltipIconTag: Story = {
  render: () => {
    return <IconTag {...tooltipProps} />;
  },
};