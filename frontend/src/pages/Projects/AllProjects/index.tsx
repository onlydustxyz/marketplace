import { gql } from "@apollo/client";
import { sortBy } from "lodash";
import { useMemo } from "react";
import ProjectCard, { PROJECT_CARD_FRAGMENT } from "src/components/ProjectCard";
import QueryWrapper from "src/components/QueryWrapper";
import { useAuth } from "src/hooks/useAuth";
import { useHasuraQuery } from "src/hooks/useHasuraQuery";
import { HasuraUserRole } from "src/types";
import { isProjectVisible } from "src/utils/project";
import { GetProjectsQuery } from "src/__generated/graphql";
import { ProjectOwnershipType } from "src/pages/Projects/types";
import AllProjectsFallback from "./AllProjectsFallback";

type Props = {
  clearFilters: () => void;
  technologies: string[];
  projectOwnershipType: ProjectOwnershipType;
};

export default function AllProjects({ clearFilters, technologies, projectOwnershipType }: Props) {
  const { ledProjectIds, githubUserId, isLoggedIn } = useAuth();

  const getProjectsQuery = useHasuraQuery<GetProjectsQuery>(
    buildGetProjectsQuery(technologies),
    HasuraUserRole.Public,
    {
      variables: { languages: technologies },
    }
  );

  const projects = useMemo(() => {
    let projects = getProjectsQuery.data?.projects.map(p => ({
      ...p,
      pendingInvitations: p.pendingInvitations.filter(i => i.githubUserId === githubUserId),
    }));
    if (projects && isLoggedIn && projectOwnershipType === ProjectOwnershipType.Mine) {
      projects = projects.filter(
        project => ledProjectIds.includes(project.id) || project.pendingInvitations.length > 0
      );
    }
    return sortBy(projects?.filter(isProjectVisible(githubUserId)), p => !p.pendingInvitations.length);
  }, [getProjectsQuery.data?.projects, ledProjectIds, projectOwnershipType, isLoggedIn]);

  return (
    <QueryWrapper query={getProjectsQuery}>
      <div className="flex flex-col gap-5 grow">
        {projects && projects.length > 0 ? (
          projects.map(project => <ProjectCard key={project.id} {...project} />)
        ) : (
          <AllProjectsFallback clearFilters={clearFilters} />
        )}
      </div>
    </QueryWrapper>
  );
}

const buildQueryFilters = (technologies: string[]) => {
  let filters = "";
  if (technologies.length) {
    filters += "{githubRepos: {githubRepoDetails: {languages: {_hasKeysAny: $languages}}}}";
  }

  return filters.length ? `where: ${filters}, ` : "";
};

export const buildGetProjectsQuery = (technologies: string[]) => gql`
  ${PROJECT_CARD_FRAGMENT}
  query GetProjects${technologies.length ? "($languages: [String!])" : ""} {
    projects(${buildQueryFilters(technologies)}orderBy: {budgetsAggregate: {sum: {spentAmount: DESC}}}) {
      ...ProjectCardFields
    }
  }
`;
