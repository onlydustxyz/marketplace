import { ComponentStory } from "@storybook/react";
import { GithubUserFragment, LiveGithubUserFragment } from "src/__generated/graphql";

import ContributorSelectView from "./View";

export default {
  title: "ContributorsSelect",
};

const filteredContributors: (GithubUserFragment & { unpaidMergedPullsCount?: number })[] = [
  {
    id: 1111,
    login: "antho",
    avatarUrl: "https://avatars.githubusercontent.com/u/43467246?v=4",
    htmlUrl: "https://github.com/AnthonyBuisset",
    user: null,
    unpaidMergedPullsCount: 3,
  },
  {
    id: 2222,
    login: "stan",
    avatarUrl: "https://avatars.githubusercontent.com/u/4435377?v=4",
    htmlUrl: "https://github.com/bernardstanislas",
    user: { id: "user-id" },
  },
  {
    id: 3333,
    login: "ofux",
    avatarUrl: "https://avatars.githubusercontent.com/u/595505?v=4",
    htmlUrl: "https://github.com/ofux",
    user: null,
    unpaidMergedPullsCount: 10,
  },
];

const filteredExternalContributors: LiveGithubUserFragment[] = [
  {
    id: 4444,
    login: "oscar",
    avatarUrl: "https://avatars.githubusercontent.com/u/21149076?v=4",
    htmlUrl: "https://github.com/oscarwroche",
    user: { id: "user-id" },
  },
  {
    id: 5555,
    login: "gregoire",
    avatarUrl: "https://avatars.githubusercontent.com/u/8642470?v=4",
    htmlUrl: "https://github.com/gregcha",
    user: { id: "user-id" },
  },
  {
    id: 6666,
    login: "timothee",
    avatarUrl: "https://avatars.githubusercontent.com/u/34384633?v=4",
    htmlUrl: "https://github.com/tdelabrouille",
    user: { id: "user-id" },
  },
];

const Template: ComponentStory<typeof ContributorSelectView> = () => {
  return (
    <div className="w-full relative">
      <ContributorSelectView {...args} />
    </div>
  );
};

const args = {
  selectedGithubHandle: "test",
  setSelectedGithubHandle: Function.prototype(),
  githubHandleSubstring: "test",
  setGithubHandleSubstring: Function.prototype(),
  filteredContributors,
  filteredExternalContributors,
  isSearchGithubUsersByHandleSubstringQueryLoading: false,
  contributor: filteredContributors[0],
  debouncedGithubHandleSubstring: "test",
};

export const Default = Template.bind({});
Default.args = args;
