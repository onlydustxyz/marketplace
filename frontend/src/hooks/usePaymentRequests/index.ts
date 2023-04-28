import { useHasuraMutation, useHasuraQuery } from "src/hooks/useHasuraQuery";
import { HasuraUserRole } from "src/types";
import {
  CancelPaymentRequestDocument,
  CancelPaymentRequestMutationResult,
  GetPaymentRequestsForProjectDocument,
  GetPaymentRequestsForProjectQuery,
  PaymentRequestFragment,
  PaymentRequestFragmentDoc,
  RequestPaymentDocument,
  RequestPaymentMutationResult,
  RequestPaymentMutationVariables,
} from "src/__generated/graphql";
import { reject } from "lodash";

export default function usePaymentRequests(projectId?: string) {
  const getPaymentRequestsQuery = useHasuraQuery<GetPaymentRequestsForProjectQuery>(
    GetPaymentRequestsForProjectDocument,
    HasuraUserRole.RegisteredUser,
    {
      variables: { projectId },
      skip: !projectId,
      nextFetchPolicy: "cache-only",
    }
  );

  const [requestNewPayment] = useHasuraMutation(RequestPaymentDocument, HasuraUserRole.RegisteredUser, {
    variables: { projectId },
    context: { graphqlErrorDisplay: "toaster" },
    update: (cache, result, { variables }) => {
      const { budgetId, paymentId, amount } = (result as RequestPaymentMutationResult).data?.requestPayment || {};
      const { contributorId, reason } = variables as RequestPaymentMutationVariables;

      const newPaymentRequestRef = cache.writeFragment<PaymentRequestFragment>({
        fragment: PaymentRequestFragmentDoc,
        data: {
          __typename: "PaymentRequests",
          id: paymentId,
          amountInUsd: amount,
          recipientId: contributorId,
          workItems: reason.workItems.map(workItem => ({ paymentId, ...workItem })),
          payments: [],
          requestedAt: Date.now(),
        },
      });

      cache.modify({
        id: `Budgets:${budgetId}`,
        fields: {
          paymentRequests: paymentRequestRefs => [...paymentRequestRefs, newPaymentRequestRef],
          remainingAmount: remainingAmount => remainingAmount - amount,
        },
      });
    },
  });

  const [cancelPaymentRequest] = useHasuraMutation(CancelPaymentRequestDocument, HasuraUserRole.RegisteredUser, {
    variables: { projectId },
    context: { graphqlErrorDisplay: "toaster" },
    update: (cache, result) => {
      const { budgetId, paymentId, amount } =
        (result as CancelPaymentRequestMutationResult).data?.cancelPaymentRequest || {};

      cache.modify({
        id: `Budgets:${budgetId}`,
        fields: {
          paymentRequests: current => reject(current, { __ref: `PaymentRequests:${paymentId}` }),
          remainingAmount: remainingAmount => remainingAmount + amount,
        },
      });

      cache.evict({
        id: `PaymentRequests:${paymentId}`,
      });
    },
  });

  return {
    ...getPaymentRequestsQuery,
    data: getPaymentRequestsQuery.data && {
      budget: getPaymentRequestsQuery.data.projectsByPk?.budgets.reduce(
        (acc, b) => ({
          remainingAmount: acc.remainingAmount + b.remainingAmount,
          initialAmount: acc.initialAmount + b.initialAmount,
        }),
        { initialAmount: 0, remainingAmount: 0 }
      ),
      paymentRequests: getPaymentRequestsQuery.data.projectsByPk?.budgets.map(b => b.paymentRequests).flat(),
    },
    requestNewPayment,
    cancelPaymentRequest,
  };
}
