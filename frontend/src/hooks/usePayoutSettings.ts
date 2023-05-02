import { gql } from "@apollo/client";
import isDefined from "src/utils/isDefined";
import { useGetUserPayoutSettingsQuery } from "src/__generated/graphql";

export default function usePayoutSettings(githubUserId?: number) {
  const query = useGetUserPayoutSettingsQuery({
    variables: { githubUserId },
    skip: !githubUserId,
    fetchPolicy: "network-only",
  });

  const userInfo = query.data?.authGithubUsers.at(0)?.user?.userInfo;
  const valid = query.data?.authGithubUsers.at(0)?.user?.userInfo?.arePayoutSettingsValid;
  const invoiceNeeded = isDefined(query.data?.authGithubUsers.at(0)?.user?.userInfo?.identity?.Company);

  return {
    ...query,
    data: userInfo,
    valid,
    invoiceNeeded,
  };
}

const USER_PAYOUT_SETTINGS_FRAGMENT = gql`
  fragment UserPayoutSettings on UserInfo {
    userId
    identity
    location
    payoutSettings
    arePayoutSettingsValid
  }
`;

export const GET_USER_PAYOUT_SETTINGS = gql`
  ${USER_PAYOUT_SETTINGS_FRAGMENT}
  query GetUserPayoutSettings($githubUserId: bigint!) {
    authGithubUsers(where: { githubUserId: { _eq: $githubUserId } }) {
      userId
      user {
        id
        userInfo {
          ...UserPayoutSettings
        }
      }
    }
  }
`;
