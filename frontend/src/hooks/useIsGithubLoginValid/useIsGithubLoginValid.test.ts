import { MockedProvider } from "@apollo/client/testing";
import { waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import useFindGithubUser from ".";
import { FindUserQueryForPaymentFormDocument } from "src/__generated/graphql";

const GITHUB_USER_LOGIN = "github-user-login";
const GITHUB_USER_ID = 12346587;

const findUserQueryMock = {
  request: {
    query: FindUserQueryForPaymentFormDocument,
    variables: { username: GITHUB_USER_LOGIN },
  },
  result: {
    data: {
      fetchUserDetails: {
        id: GITHUB_USER_ID,
        avatarUrl: "https://avatars.githubusercontent.com/u/12346587?v=4",
        login: GITHUB_USER_LOGIN,
        user: null,
        __typename: "User",
      },
    },
  },
};

const render = () =>
  renderHook(() => useFindGithubUser(), {
    wrapper: MockedProvider,
    initialProps: { mocks: [findUserQueryMock] },
  });

describe("useIsGithubLoginValid", () => {
  it("should trigger query when requested", async () => {
    const { result } = render();

    result.current.trigger(GITHUB_USER_LOGIN);
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user?.id).toBe(GITHUB_USER_ID);
    });
  });
});
