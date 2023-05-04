import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";
import { MemoryRouterProviderFactory, renderWithIntl } from "src/test/utils";
import { LOCAL_STORAGE_TOKEN_SET_KEY } from "src/hooks/useTokenSet";
import Contributors from ".";
import {
  ContributorsTableFieldsFragment,
  GetProjectContributorsDocument,
  GetProjectContributorsQueryResult,
  GithubRepoContributorsFieldsFragment,
  PaymentRequestFragment,
} from "src/__generated/graphql";

expect.extend(matchers);

vi.mock("axios", () => ({
  default: {
    post: () => ({ data: HASURA_TOKEN_BASIC_TEST_VALUE }),
  },
}));

const TEST_USER_ID = "test-user-id";
const TEST_PROJECT_ID = "test-project-id";

const HASURA_TOKEN_BASIC_TEST_VALUE = {
  user: {
    id: TEST_USER_ID,
  },
  accessToken: "SOME_TOKEN",
  accessTokenExpiresIn: 900,
  creationDate: new Date().getTime(),
};

const mockPaymentRequest: PaymentRequestFragment = {
  id: "request-1",
  amountInUsd: 1000,
  workItemsAggregate: { aggregate: { count: 2 } },
  paymentsAggregate: { aggregate: { sum: { amount: 0 } } },
  requestedAt: new Date(),
  recipientId: 122345,
};

const mockPaymentRequest2: PaymentRequestFragment = {
  id: "request-2",
  amountInUsd: 500,
  workItemsAggregate: { aggregate: { count: 1 } },
  paymentsAggregate: { aggregate: { sum: { amount: 0 } } },
  requestedAt: new Date(),
  recipientId: 122345,
};

const contributor1: ContributorsTableFieldsFragment = {
  __typename: "User",
  id: 123456,
  avatarUrl: "avatar_url",
  login: "ofux",
  htmlUrl: "https://github.com/ofux",
  user: null,
  paymentRequests: [mockPaymentRequest, mockPaymentRequest],
};

const contributor2: ContributorsTableFieldsFragment = {
  __typename: "User",
  id: 123457,
  avatarUrl: "avatar_url",
  login: "AnthonyBuisset",
  htmlUrl: "https://github.com/AnthonyBuisset",
  user: null,
  paymentRequests: [mockPaymentRequest2],
};

const contributor3: ContributorsTableFieldsFragment = {
  __typename: "User",
  id: 123458,
  avatarUrl: "avatar_url",
  login: "oscarwroche",
  htmlUrl: "https://github.com/oscarwroche",
  user: null,
  paymentRequests: [],
};

const githubRepo1: GithubRepoContributorsFieldsFragment = {
  __typename: "ProjectGithubRepos",
  githubRepoId: 1000,
  githubRepoDetails: {
    id: 1000,
    content: {
      id: 1000,
      contributors: [contributor1, contributor2],
    },
  },
};

const githubRepo2: GithubRepoContributorsFieldsFragment = {
  __typename: "ProjectGithubRepos",
  githubRepoId: 1001,
  githubRepoDetails: {
    id: 1001,
    content: {
      id: 1001,
      contributors: [contributor1, contributor3],
    },
  },
};

const graphQlMocks = [
  {
    request: {
      query: GetProjectContributorsDocument,
      variables: {
        projectId: TEST_PROJECT_ID,
      },
    },
    result: {
      data: {
        projectsByPk: {
          __typename: "Projects",
          id: TEST_PROJECT_ID,
          githubRepos: [
            { projectId: TEST_PROJECT_ID, ...githubRepo1 },
            { projectId: TEST_PROJECT_ID, ...githubRepo2 },
          ],
          budgets: [],
          projectDetails: {
            projectId: TEST_PROJECT_ID,
            name: "test-project",
          },
        },
      } as GetProjectContributorsQueryResult["data"],
    },
  },
];

describe('"ProjectDetails" page', () => {
  beforeAll(() => {
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_SET_KEY, JSON.stringify(HASURA_TOKEN_BASIC_TEST_VALUE));
  });

  beforeEach(() => {
    renderWithIntl(<Contributors />, {
      wrapper: MemoryRouterProviderFactory({
        mocks: graphQlMocks,
        context: { projectId: TEST_PROJECT_ID },
      }),
    });
  });

  it("should render the contributors table", async () => {
    await screen.findByText(/contributors/i);
    await screen.findByText(/2,000/i);
    await screen.findByText(/500/i);
    await screen.findByText(/ofux/i);
    await screen.findByText(/AnthonyBuisset/i);
    await screen.findByText(/oscarwroche/i);
  });
});
