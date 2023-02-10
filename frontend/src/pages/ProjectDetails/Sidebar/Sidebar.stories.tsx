import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ProjectDetailsTab } from "src/pages/ProjectDetails/Sidebar";
import { withRouter } from "storybook-addon-react-router-v6";
import { ProjectDetailsTab__deprecated } from "../ProjectDetailsContext";
import View from "./View";

export default {
  title: "ProjectsSidebar",
  component: View,
  decorators: [withRouter],
} as ComponentMeta<typeof View>;

const availableTabs__deprecated = [
  ProjectDetailsTab__deprecated.Overview,
  ProjectDetailsTab__deprecated.Contributors,
  ProjectDetailsTab__deprecated.Payments,
];
const availableTabs: ProjectDetailsTab[] = [];

const currentProject = {
  id: "test-project-id",
  name: "Our project",
  logoUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
  leads: [
    {
      id: "leader-id",
      displayName: "Leader",
      avatarUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
    },
  ],
  nbContributors: 4,
  withInvitation: false,
};
const otherProject = {
  id: "other-project-id",
  name: "Other project",
  logoUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
  leads: [
    {
      id: "leader-id",
      displayName: "Leader",
      avatarUrl: "https://avatars.githubusercontent.com/u/98735558?v=4",
    },
  ],
  nbContributors: 4,
  withInvitation: false,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const empty = () => {};
const selectedTab = ProjectDetailsTab__deprecated.Overview;
const expandable = true;
const allProjects = [currentProject, otherProject];

const Template: ComponentStory<typeof View> = () => (
  <View
    {...{
      expandable,
      currentProject,
      allProjects,
      onProjectSelected: empty,
      selectedTab,
      availableTabs,
      availableTabs__deprecated,
      dispatch: empty,
      projectLead: true,
    }}
  />
);

export const Default = Template.bind({});
