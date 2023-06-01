import { describe, expect, it, Mock, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

import Layout from ".";
import { AuthProvider } from "src/hooks/useAuth";
import { BrowserRouter } from "react-router-dom";
import { MemoryRouterProviderFactory, renderWithIntl } from "src/test/utils";
import { MockedProvider } from "@apollo/client/testing";
import { LOCAL_STORAGE_TOKEN_SET_KEY, TokenSetProvider } from "src/hooks/useTokenSet";
import { SessionProvider } from "src/hooks/useSession";
import { ToasterProvider } from "src/hooks/useToaster";
import { useRoles } from "src/hooks/useAuth/useRoles";
import { HasuraUserRole } from "src/types";
import { ImpersonationClaimsProvider } from "src/hooks/useImpersonationClaims";
import { GetPaymentRequestIdsDocument, GetPaymentRequestIdsQueryResult } from "src/__generated/graphql";
import { ContributorProfilePanelProvider } from "src/hooks/useContributorProfilePanel";

expect.extend(matchers);

const userId = "33f15d41-5383-4a73-b96b-347ece03513a";
const user = {
  id: userId,
};
const githubUserId = 666;

const HASURA_TOKEN_BASIC_TEST_VALUE = {
  user: {
    id: userId,
  },
  githubUserId,
  accessToken: "SOME_TOKEN",
  accessTokenExpiresIn: 900,
  creationDate: new Date().getTime(),
};
const ONLYDUST_TITLE_NAME_QUERY = /onlydust title/i;
const ONLYDUST_LOGO_NAME_QUERY = /onlydust logo/i;

vi.mock("axios", () => ({
  default: {
    post: () => ({ data: HASURA_TOKEN_BASIC_TEST_VALUE }),
  },
}));

vi.mock("src/hooks/useAuth/useRoles");

const buildMockPaymentsQuery = (githubUserId: number, paymentRequests: Record<string, unknown>[] = []) => ({
  request: {
    query: GetPaymentRequestIdsDocument,
    variables: {
      githubUserId,
    },
  },
  result: {
    data: {
      githubUsersByPk: {
        paymentRequests,
      },
    } as GetPaymentRequestIdsQueryResult["data"],
  },
});

describe('"Layout" component', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("should not render Payments menu item when githubUserId is undefined", async () => {
    (useRoles as Mock).mockReturnValue({
      isLoggedIn: true,
      roles: [HasuraUserRole.RegisteredUser],
      user,
      githubUserId: undefined,
    });

    const queryMock = {
      request: {
        query: GetPaymentRequestIdsDocument,
        variables: {
          githubUserId,
        },
      },
      newData: vi.fn(() => ({})),
    };

    renderWithIntl(<Layout />, {
      wrapper: MemoryRouterProviderFactory({
        mocks: [queryMock],
      }),
    });

    await waitFor(() => {
      expect(queryMock.newData).not.toHaveBeenCalled();
    });
    expect(screen.queryByText("Payments")).not.toBeInTheDocument();
  });

  it("should not render Payments menu item if user has no payment", async () => {
    (useRoles as Mock).mockReturnValue({
      isLoggedIn: true,
      roles: [HasuraUserRole.RegisteredUser],
      user,
      githubUserId,
    });

    renderWithIntl(<Layout />, {
      wrapper: MemoryRouterProviderFactory({
        mocks: [buildMockPaymentsQuery(githubUserId, [])],
      }),
    });

    expect(screen.queryByText("Payments")).not.toBeInTheDocument();
  });

  it("should render My Payments menu item if user has some payments", async () => {
    (useRoles as Mock).mockReturnValue({
      isLoggedIn: true,
      roles: [HasuraUserRole.RegisteredUser],
      user,
      githubUserId,
    });

    renderWithIntl(<Layout />, {
      wrapper: MemoryRouterProviderFactory({
        mocks: [buildMockPaymentsQuery(githubUserId, [{ id: "705e6b37-d0ee-4e87-b681-7009dd691965" }])],
      }),
    });

    expect(await screen.findByText("Payments")).toBeInTheDocument();
  });

  it("should always display the onlydust logo", async () => {
    renderTest();
    await screen.findByRole("img", {
      name: ONLYDUST_LOGO_NAME_QUERY,
    });
  });

  it("should display the github logo when user is not logged in", async () => {
    window.localStorage.removeItem(LOCAL_STORAGE_TOKEN_SET_KEY);
    (useRoles as Mock).mockReturnValue({
      isLoggedIn: false,
      roles: [],
      user: undefined,
      githubUserId: undefined,
    });
    renderTest();
    await screen.findByRole("githubLogo");
  });

  it("should display the onlydust logo and title if there is no hasura jwt", () => {
    window.localStorage.setItem(LOCAL_STORAGE_TOKEN_SET_KEY, JSON.stringify("test"));
    renderTest();
    expect(
      screen.getByRole("img", {
        name: ONLYDUST_LOGO_NAME_QUERY,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: ONLYDUST_TITLE_NAME_QUERY,
      })
    ).toBeInTheDocument();
  });
});

const renderTest = () => {
  return renderWithIntl(
    <ToasterProvider>
      <MockedProvider>
        <SessionProvider>
          <TokenSetProvider>
            <ImpersonationClaimsProvider>
              <AuthProvider>
                <ContributorProfilePanelProvider>
                  <Layout />
                </ContributorProfilePanelProvider>
              </AuthProvider>
            </ImpersonationClaimsProvider>
          </TokenSetProvider>
        </SessionProvider>
      </MockedProvider>
    </ToasterProvider>,
    { wrapper: BrowserRouter }
  );
};
