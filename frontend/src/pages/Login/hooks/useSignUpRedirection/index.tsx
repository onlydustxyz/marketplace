import { gql, OperationVariables, QueryResult } from "@apollo/client";
import { generatePath } from "react-router-dom";
import { RoutePaths } from "src/App";
import { useHasuraQuery } from "src/hooks/useHasuraQuery";
import usePayoutSettings from "src/hooks/usePayoutSettings";
import { HasuraUserRole } from "src/types";
import { PendingProjectLeaderInvitationsQuery, PendingUserPaymentsQuery } from "src/__generated/graphql";

export type User = {
  githubUserId?: number;
  userId?: string;
};

export default function useSignupRedirection({ githubUserId, userId }: User) {
  const pendingProjectLeaderInvitationsQuery = useHasuraQuery<PendingProjectLeaderInvitationsQuery>(
    PENDING_PROJECT_LEADER_INVITATIONS_QUERY,
    HasuraUserRole.RegisteredUser,
    {
      variables: { githubUserId },
      skip: !githubUserId,
    }
  );

  const { valid } = usePayoutSettings(githubUserId);

  const pendingUserPaymentsAndPayoutSettingsQuery = useHasuraQuery<PendingUserPaymentsQuery>(
    PENDING_USER_PAYMENTS,
    HasuraUserRole.RegisteredUser,
    {
      variables: { userId: userId },
      skip: !userId,
    }
  );

  return {
    loading: pendingProjectLeaderInvitationsQuery.loading || pendingUserPaymentsAndPayoutSettingsQuery.loading,
    url: getRedirectionUrl(pendingProjectLeaderInvitationsQuery, pendingUserPaymentsAndPayoutSettingsQuery, !valid),
  };
}

const getRedirectionUrl = (
  pendingProjectLeaderInvitationsQuery: QueryResult<PendingProjectLeaderInvitationsQuery, OperationVariables>,
  pendingUserPaymentsAndPayoutSettingsQuery: QueryResult<PendingUserPaymentsQuery, OperationVariables>,
  missingPayoutInfo: boolean
) => {
  const pendingPaymentRequests =
    pendingUserPaymentsAndPayoutSettingsQuery.data?.user?.githubUser?.paymentRequests.filter(
      r => r.amountInUsd > r.paymentsAggregate.aggregate?.sum?.amount
    );

  if (missingPayoutInfo && pendingPaymentRequests && pendingPaymentRequests.length > 0) {
    return RoutePaths.Payments;
  }

  const projectId = pendingProjectLeaderInvitationsQuery?.data?.pendingProjectLeaderInvitations?.[0]?.projectId;
  if (projectId) {
    return generatePath(RoutePaths.ProjectDetails, { projectId });
  }

  return RoutePaths.Projects;
};

export const PENDING_PROJECT_LEADER_INVITATIONS_QUERY = gql`
  query PendingProjectLeaderInvitations($githubUserId: bigint) {
    pendingProjectLeaderInvitations(where: { githubUserId: { _eq: $githubUserId } }) {
      id
      projectId
    }
  }
`;

export const PENDING_USER_PAYMENTS = gql`
  query PendingUserPayments($userId: uuid!) {
    user(id: $userId) {
      githubUser {
        paymentRequests {
          amountInUsd
          paymentsAggregate {
            aggregate {
              sum {
                amount
              }
            }
          }
        }
      }
    }
  }
`;
