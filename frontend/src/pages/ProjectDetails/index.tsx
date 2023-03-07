import { gql } from "@apollo/client";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import QueryWrapper from "src/components/QueryWrapper";
import { useAuth } from "src/hooks/useAuth";
import { useHasuraMutation, useHasuraQuery } from "src/hooks/useHasuraQuery";
import { HasuraUserRole, LanguageMap } from "src/types";
import { GetProjectQuery, ProjectLeadFragment, SponsorFragment } from "src/__generated/graphql";
import onlyDustLogo from "assets/img/onlydust-logo-space.jpg";
import { SessionMethod, useSessionDispatch, useSession } from "src/hooks/useSession";
import View from "./View";
import { PROJECT_CARD_FRAGMENT } from "src/components/ProjectCard";
import { isProjectVisible } from "src/utils/project";
import { RoutePaths } from "src/App";

type ProjectDetailsParams = {
  projectId: string;
};

export interface ProjectDetails {
  id: string;
  name?: string;
  logoUrl: string;
  telegramLink?: string | null;
  leads: ({ id: string } & ProjectLeadFragment)[];
  invitationId?: string;
  totalSpentAmountInUsd?: number;
  languages: LanguageMap;
  sponsors: SponsorFragment[];
}

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<ProjectDetailsParams>();
  const { ledProjectIds, githubUserId } = useAuth();
  const { lastVisitedProjectId } = useSession();
  const dispatchSession = useSessionDispatch();

  const [acceptInvitation, acceptInvitationResponse] = useHasuraMutation(
    ACCEPT_PROJECT_LEADER_INVITATION_MUTATION,
    HasuraUserRole.RegisteredUser
  );

  const getProjectQuery = useHasuraQuery<GetProjectQuery>(GET_PROJECT_QUERY, HasuraUserRole.Public, {
    variables: { id: projectId, githubUserId },
    skip: !projectId,
  });

  const project = getProjectQuery.data?.projectsByPk;

  useEffect(() => {
    if (
      (project && project.id !== lastVisitedProjectId && ledProjectIds.includes(project.id)) ||
      !!project?.pendingInvitations.length
    ) {
      dispatchSession({ method: SessionMethod.SetLastVisitedProjectId, value: project.id });
    }
  }, [project, ledProjectIds]);

  useEffect(() => {
    if (acceptInvitationResponse.data) {
      window.location.reload();
    }
  }, [acceptInvitationResponse.data]);

  return (
    <QueryWrapper query={getProjectQuery}>
      {project !== undefined &&
        (isProjectVisible(githubUserId)(project) ? (
          <View
            currentProject={projectFromQuery(project, githubUserId)}
            onInvitationAccepted={(invitationId: string) => {
              acceptInvitation({
                variables: {
                  invitationId,
                },
              });
            }}
          />
        ) : (
          <Navigate to={RoutePaths.Projects} />
        ))}
    </QueryWrapper>
  );
};

const projectFromQuery = (project: GetProjectQuery["projectsByPk"], githubUserId?: number): ProjectDetails => ({
  id: project?.id,
  name: project?.projectDetails?.name,
  logoUrl: project?.projectDetails?.logoUrl || onlyDustLogo,
  leads: project?.projectLeads?.map((lead: any) => ({ id: lead.userId, ...lead.user })) || [],
  invitationId: project?.pendingInvitations.filter(i => i.githubUserId === githubUserId).at(0)?.id,
  totalSpentAmountInUsd: project?.budgetsAggregate.aggregate?.sum?.spentAmount,
  telegramLink: project?.projectDetails?.telegramLink,
  languages: (project?.githubRepos?.length === 1 && project?.githubRepos[0].githubRepoDetails?.languages) || {},
  sponsors: project?.projectSponsors?.map(projectSponsor => projectSponsor.sponsor) || [],
});

export const GET_PROJECT_QUERY = gql`
  ${PROJECT_CARD_FRAGMENT}
  query GetProject($id: uuid!, $githubUserId: bigint = 0) {
    projectsByPk(id: $id) {
      ...ProjectCardFields
    }
  }
`;

const ACCEPT_PROJECT_LEADER_INVITATION_MUTATION = gql`
  mutation acceptProjectLeaderInvitation($invitationId: Uuid!) {
    acceptProjectLeaderInvitation(invitationId: $invitationId)
  }
`;

export default ProjectDetails;
