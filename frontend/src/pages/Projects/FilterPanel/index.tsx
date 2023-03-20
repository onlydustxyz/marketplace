import { gql } from "@apollo/client";
import { useAuth } from "src/hooks/useAuth";
import { useHasuraQuery } from "src/hooks/useHasuraQuery";
import { HasuraUserRole } from "src/types";
import {
  getDeduplicatedAggregatedLanguages,
  getMostUsedLanguages,
  GITHUB_REPOS_LANGUAGES_FRAGMENT,
} from "src/utils/languages";
import { isProjectVisible, VISIBLE_PROJECT_FRAGMENT } from "src/utils/project";
import { GetAllTechnologiesQuery } from "src/__generated/graphql";
import { ProjectFilter, ProjectFilterAction } from "src/pages/Projects/types";
import View from "./View";

type Props = {
  projectFilter: ProjectFilter;
  dispatchProjectFilter: (action: ProjectFilterAction) => void;
  isProjectFilterCleared: () => boolean;
  isProjectLeader: boolean;
};

export default function FilterPanel({
  projectFilter,
  dispatchProjectFilter,
  isProjectFilterCleared,
  isProjectLeader,
}: Props) {
  const { githubUserId } = useAuth();
  const technologiesQuery = useHasuraQuery<GetAllTechnologiesQuery>(GET_ALL_TECHNOLOGIES_QUERY, HasuraUserRole.Public);

  const availableTechnologies = new Set(
    technologiesQuery.data?.projects
      .filter(isProjectVisible(githubUserId))
      .map(p => getMostUsedLanguages(getDeduplicatedAggregatedLanguages(p.githubRepos)))
      .flat()
  );

  return (
    <View
      availableTechnologies={Array.from(availableTechnologies).sort((t1: string, t2: string) => t1.localeCompare(t2))}
      projectFilter={projectFilter}
      dispatchProjectFilter={dispatchProjectFilter}
      isProjectFilterCleared={isProjectFilterCleared}
      isProjectLeader={isProjectLeader}
    />
  );
}

export const GET_ALL_TECHNOLOGIES_QUERY = gql`
  ${VISIBLE_PROJECT_FRAGMENT}
  ${GITHUB_REPOS_LANGUAGES_FRAGMENT}
  query GetAllTechnologies {
    projects {
      ...VisibleProject
      githubRepos {
        ...GithubRepoLanguagesFields
      }
    }
  }
`;
