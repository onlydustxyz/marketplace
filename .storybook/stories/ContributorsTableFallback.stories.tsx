import { ComponentStory, ComponentMeta } from "@storybook/react";
import ContributorsTableFallback from "src/components/ContributorsTableFallback";

export default {
  title: "ContributorsTableFallback",
  component: ContributorsTableFallback,
} as ComponentMeta<typeof ContributorsTableFallback>;

const Template: ComponentStory<typeof ContributorsTableFallback> = () => (
  <ContributorsTableFallback projectName="My Project" />
);

export const Default = Template.bind({});
