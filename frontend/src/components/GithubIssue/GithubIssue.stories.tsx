import { Status, Type } from "src/__generated/graphql";
import GithubIssue, { Action, Props } from ".";
import { daysFromNow } from "src/utils/date";

const issues = {
  closed: {
    id: 1268051991,
    repoId: 123456,
    number: 541,
    type: Type.Issue,
    status: Status.Closed,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(5),
    mergedAt: null,
  },
  closedWithLongLink: {
    id: 1268051991,
    repoId: 123456,
    number: 541,
    type: Type.Issue,
    status: Status.Closed,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(5),
    mergedAt: null,
  },
  prOpen: {
    id: 1268051991,
    repoId: 123456,
    number: 541,
    type: Type.PullRequest,
    status: Status.Open,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(5),
    mergedAt: null,
  },
  issueOpen: {
    id: 1268051991,
    repoId: 123456,
    number: 541,
    type: Type.Issue,
    status: Status.Open,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(5),
    mergedAt: null,
  },
  merged: {
    id: 1268051991,
    repoId: 123456,
    number: 541,
    type: Type.PullRequest,
    status: Status.Merged,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(5),
    mergedAt: daysFromNow(5),
  },
  completed: {
    id: 1268051991,
    repoId: 123456,
    number: 541,
    type: Type.Issue,
    status: Status.Completed,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(5),
    mergedAt: daysFromNow(5),
  },
  cancelled: {
    id: 1268051991,
    repoId: 123456,
    number: 541,
    type: Type.Issue,
    status: Status.Cancelled,
    htmlUrl: "https://github.com/sayajin-labs/kakarot/pull/541",
    title: "Disable RPC json validation in devnet",
    createdAt: daysFromNow(6),
    closedAt: daysFromNow(5),
    mergedAt: daysFromNow(5),
  },
};

export default {
  title: "GithubIssue",
  component: GithubIssue,
  argTypes: {
    action: {
      control: { type: "select" },
      options: [undefined, Action.Add, Action.Remove],
    },
    workItem: {
      options: Object.keys(issues),
      mapping: issues,
      control: { type: "select" },
    },
  },
};

const defaultProps: Props = { workItem: issues.closed };

export const Default = {
  render: (args: Props) => <GithubIssue {...defaultProps} {...args} />,
};
const longLinkProps: Props = { workItem: issues.closedWithLongLink };

export const LongLink = {
  render: (args: Props) => <GithubIssue {...longLinkProps} {...args} />,
};
