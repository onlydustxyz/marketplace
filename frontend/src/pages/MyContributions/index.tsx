import { gql, QueryResult } from "@apollo/client";
import { Link } from "react-router-dom";
import { RoutePaths } from "src/App";
import Card from "src/components/Card";
import PaymentTableFallback from "src/components/PaymentTableFallback";
import PayoutTable, { mapApiPaymentsToProps } from "src/components/PayoutTable";
import QueryWrapper from "src/components/QueryWrapper";
import { useAuth } from "src/hooks/useAuth";
import { useHasuraQuery } from "src/hooks/useHasuraQuery";
import { HasuraUserRole } from "src/types";
import isPayoutInfoMissing from "src/utils/isPayoutInfoMissing";
import { GetPaymentRequestsQuery, PayoutSettingsQuery } from "src/__generated/graphql";
import { useT } from "talkr";
import InfoMissingBanner from "../Profile/components/InfoMissingBanner";

const MyContributions = () => {
  const { githubUserId } = useAuth();
  const { T } = useT();

  const getPaymentRequestsQuery = useHasuraQuery<GetPaymentRequestsQuery>(
    GET_MY_CONTRIBUTIONS_QUERY,
    HasuraUserRole.RegisteredUser,
    {
      variables: { githubId: githubUserId },
      context: {
        graphqlErrorDisplay: "none",
      },
    }
  );
  const getPayoutSettingsQuery = useHasuraQuery<PayoutSettingsQuery>(
    GET_PAYOUT_SETTINGS_QUERY,
    HasuraUserRole.RegisteredUser,
    {
      fetchPolicy: "network-only",
    }
  );

  const { data: paymentRequestsQueryData } = getPaymentRequestsQuery;
  const payments = paymentRequestsQueryData?.paymentRequests?.map(mapApiPaymentsToProps);
  const hasPayments = payments && payments.length > 0;

  return (
    <div className="bg-space h-full">
      <div className="container mx-auto pt-16 h-full">
        <div className="text-5xl font-belwe">{T("navbar.myContributions")}</div>
        <QueryWrapper query={getPaymentRequestsQuery}>
          <div className="mt-10 h-full">
            {isPayoutInfoMissing(getPayoutSettingsQuery) && hasPendingPaymentsRequests(getPaymentRequestsQuery) && (
              <InfoMissingBanner>
                <Link
                  to={RoutePaths.Profile}
                  className="flex flex-row justify-between items-center gap-2 w-fit rounded-xl bg-neutral-100 shadow-inner shadow-neutral-400 px-4 py-3 text-black hover:cursor-pointer"
                >
                  <div data-testid="accept-invite-button">
                    <div>{T("profile.missing.button")}</div>
                  </div>
                </Link>
              </InfoMissingBanner>
            )}
          </div>
          <div>
            <Card>{hasPayments ? <PayoutTable payments={payments} /> : <PaymentTableFallback />}</Card>
          </div>
        </QueryWrapper>
      </div>
    </div>
  );
};

function hasPendingPaymentsRequests(queryResult: QueryResult<GetPaymentRequestsQuery>) {
  return !!queryResult?.data?.paymentRequests?.length;
}

export const GET_MY_CONTRIBUTIONS_QUERY = gql`
  query GetPaymentRequests($githubId: bigint!) {
    paymentRequests(where: { recipientId: { _eq: $githubId } }) {
      id
      requestedAt
      payments {
        amount
        currencyCode
      }
      amountInUsd
      reason
      budget {
        project {
          id
          name
          projectDetails {
            description
            logoUrl
          }
          githubRepo {
            content {
              logoUrl
            }
          }
        }
      }
    }
  }
`;

export const GET_PAYOUT_SETTINGS_QUERY = gql`
  query PayoutSettings {
    userInfo {
      payoutSettings
    }
  }
`;

export default MyContributions;
