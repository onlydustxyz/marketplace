import { useCallback } from "react";
import { useLocalStorage } from "react-use";
import Background, { BackgroundRoundedBorders } from "src/components/Background";
import { useAuth } from "src/hooks/useAuth";
import { ArrayElement } from "src/types";
import { GetProjectsQuery } from "src/__generated/graphql";
import { useT } from "talkr";
import AllProjects from "./AllProjects";
import FilterPanel from "./FilterPanel";

export type Project = ArrayElement<GetProjectsQuery["projects"]>;

export enum ProjectOwnershipType {
  All = "All",
  Mine = "Mine",
}

export interface ProjectFilter {
  ownershipType: ProjectOwnershipType;
  technologies: string[];
}

const PROJECT_FILTER_KEY = "project_filter";

const DEFAULT_FILTER: ProjectFilter = {
  ownershipType: ProjectOwnershipType.All,
  technologies: [],
};

export default function Projects() {
  const { T } = useT();
  const { ledProjectIds } = useAuth();

  const [projectFilter, setProjectFilter] = useLocalStorage(PROJECT_FILTER_KEY, DEFAULT_FILTER);
  const clearProjectFilter = useCallback(() => setProjectFilter(DEFAULT_FILTER), [setProjectFilter]);

  return (
    <Background roundedBorders={BackgroundRoundedBorders.Full}>
      <div className="md:container md:mx-auto pt-8 xl:pt-16 pb-8 px-4 md:px-12 h-full">
        <div className="hidden xl:block text-5xl font-belwe">{T("navbar.projects")}</div>
        <div className="flex xl:mt-8 gap-6 h-full">
          <div className="hidden xl:block basis-80 shrink-0">
            {projectFilter && (
              <FilterPanel
                projectFilter={projectFilter}
                setProjectFilter={setProjectFilter}
                clearProjectFilter={clearProjectFilter}
                isProjectFilterCleared={() => JSON.stringify(projectFilter) == JSON.stringify(DEFAULT_FILTER)}
                isProjectLeader={!!ledProjectIds.length}
              />
            )}
          </div>
          {projectFilter && projectFilter.technologies && projectFilter.ownershipType && (
            <AllProjects
              technologies={projectFilter.technologies}
              projectOwnershipType={projectFilter.ownershipType}
              clearFilters={clearProjectFilter}
            />
          )}
        </div>
      </div>
    </Background>
  );
}
