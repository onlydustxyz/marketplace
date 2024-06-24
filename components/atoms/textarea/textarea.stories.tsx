import { Meta, StoryObj } from "@storybook/react";

import { Icon } from "components/layout/icon/icon";

import { TextareaCore } from "./textarea.core";
import { TTextareaProps } from "./textarea.types";
import { Textarea } from "./variants/textarea-default";

type Story = StoryObj<typeof TextareaCore>;

const defaultProps: TTextareaProps = {
  startContent: <Icon remixName="ri-square-line" className={"text-inherit"} />,
  endContent: <Icon remixName="ri-square-line" className={"text-inherit"} />,
  value: "Input text",
};

const meta: Meta<typeof TextareaCore> = {
  component: TextareaCore,
  title: "Atoms/Textarea",
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "black",
      values: [{ name: "black", value: "#1E1E1E" }],
    },
  },
};

export const Default: Story = {
  parameters: {
    docs: {
      source: { code: "<Textarea />" },
    },
  },
  render: args => {
    return (
      <div className="flex w-[348px] items-center gap-2">
        <Textarea {...defaultProps} {...args} />
      </div>
    );
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      source: { code: "<Textarea isDisabled={true} />" },
    },
  },
  render: () => {
    return (
      <div className="flex w-[348px] items-center gap-2">
        <Textarea {...defaultProps} isDisabled={true} />
      </div>
    );
  },
};

export const Invalid: Story = {
  parameters: {
    docs: {
      source: { code: "<Textarea isError={true} />" },
    },
  },
  render: () => {
    return (
      <div className="flex w-[348px] items-center gap-2">
        <Textarea {...defaultProps} isError={true} />
      </div>
    );
  },
};

export default meta;
