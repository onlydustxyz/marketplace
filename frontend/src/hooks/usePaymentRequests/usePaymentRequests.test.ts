import { MockedProvider } from "@apollo/client/testing";
import { waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { GetPaymentRequestsForProjectDocument, PaymentRequestFragment } from "src/__generated/graphql";
import usePaymentRequests from ".";

const PROJECT_ID = "project-id";
const GITHUB_USER_ID_1 = 123456;
const GITHUB_USER_ID_2 = 654321;

const paymentRequestTemplate = {
  id: "705e6b37-d0ee-4e87-b681-7009dd691965",
  paymentsAggregate: { aggregate: { sum: { amount: 200 } } },
  amountInUsd: 200,
  workItemsAggregate: { aggregate: { count: 1 } },
};

const mockPaymentRequest = (githubUserId: number): PaymentRequestFragment => ({
  ...paymentRequestTemplate,
  __typename: "PaymentRequests",
  recipientId: githubUserId,
  requestedAt: new Date(),
});

const getPaymentRequestsMock = {
  request: {
    query: GetPaymentRequestsForProjectDocument,
    variables: { projectId: PROJECT_ID },
  },
  result: {
    data: {
      projectsByPk: {
        budgets: [
          {
            initialAmount: 1000,
            remainingAmount: 400,
            paymentRequests: [
              mockPaymentRequest(GITHUB_USER_ID_1),
              mockPaymentRequest(GITHUB_USER_ID_1),
              mockPaymentRequest(GITHUB_USER_ID_2),
            ],
          },
        ],
      },
    },
  },
};

const render = (projectId: string) =>
  renderHook(() => usePaymentRequests(projectId), {
    wrapper: MockedProvider,
    initialProps: {
      mocks: [getPaymentRequestsMock],
    },
  });

describe("useGetPaymentRequests", () => {
  it("should return all payment requests for given project", async () => {
    const { result } = render(PROJECT_ID);
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.budget).toEqual({ initialAmount: 1000, remainingAmount: 400 });
    expect(result.current.data?.paymentRequests).toHaveLength(3);
    expect(result.current.data?.paymentRequests?.at(0)?.recipientId).toBe(GITHUB_USER_ID_1);
    expect(result.current.data?.paymentRequests?.at(1)?.recipientId).toBe(GITHUB_USER_ID_1);
    expect(result.current.data?.paymentRequests?.at(2)?.recipientId).toBe(GITHUB_USER_ID_2);
  });
});
