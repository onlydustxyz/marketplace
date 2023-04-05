import { gql } from "@apollo/client";
import { ImpersonatedLeadProjectsQuery, ImpersonatedUserQuery } from "src/__generated/graphql";
import { useHasuraQuery } from "src/hooks/useHasuraQuery";
import { useTokenSet } from "src/hooks/useTokenSet";
import { HasuraUserRole, Locale, User } from "src/types";

export const useImpersonation = () => {
  const { impersonationSet, clearImpersonationSet } = useTokenSet();

  const impersonatedUserQuery = useHasuraQuery<ImpersonatedUserQuery>(IMPERSONATED_USER_QUERY, HasuraUserRole.Admin, {
    variables: {
      id: impersonationSet?.userId,
    },
    skip: !impersonationSet,
  });
  const impersonating = !!impersonatedUserQuery.data;

  const leadProjectsQuery = useHasuraQuery<ImpersonatedLeadProjectsQuery>(
    IMPERSONATED_LEAD_PROJECTS_QUERY,
    HasuraUserRole.Admin,
    {
      variables: {
        userId: impersonationSet?.userId,
      },
      skip: !impersonationSet,
    }
  );

  const impersonatedUser = impersonatedUserQuery.data?.user
    ? mapImpersonatedUser(impersonatedUserQuery.data.user)
    : null;

  const impersonatedRoles = [HasuraUserRole.RegisteredUser];

  const impersonatedGithubUserId = impersonatedUserQuery.data?.user?.githubUser?.githubUserId as number | undefined;
  const impersonatedLedProjectIds: string[] = leadProjectsQuery.data?.projectLeads.map(lead => lead.projectId) ?? [];

  return {
    impersonating,
    impersonatedRoles,
    impersonatedUser,
    impersonatedGithubUserId,
    impersonatedLedProjectIds,
    stopImpersonation: clearImpersonationSet,
  };
};

const IMPERSONATED_USER_QUERY = gql`
  query ImpersonatedUser($id: uuid!) {
    user(id: $id) {
      id
      createdAt
      displayName
      email
      avatarUrl
      locale
      isAnonymous
      defaultRole
      emailVerified
      phoneNumber
      phoneNumberVerified
      activeMfaType
      roles {
        role
      }
      githubUser {
        githubUserId
      }
    }
  }
`;

const IMPERSONATED_LEAD_PROJECTS_QUERY = gql`
  query ImpersonatedLeadProjects($userId: uuid!) {
    projectLeads(where: { userId: { _eq: $userId } }) {
      projectId
    }
  }
`;

const mapImpersonatedUser = (user: ImpersonatedUserQuery["user"]): User | null => {
  if (user === null) {
    return null;
  }
  return {
    ...user,
    roles: user.roles.map(({ role }) => role) as HasuraUserRole[],
    locale: user.locale as Locale,
    defaultRole: user.defaultRole as HasuraUserRole,
  };
};
