import Background, { BackgroundRoundedBorders } from "src/components/Background";
import { useAuth } from "src/hooks/useAuth";
import { useT } from "talkr";
import AllProjects from "./AllProjects";
import FilterPanel from "./FilterPanel";
import { ProjectFilterProvider } from "./useProjectFilter";
import useScrollRestoration from "./AllProjects/useScrollRestoration";
import { Suspense } from "react";
import Loader from "src/components/Loader";
import SortingDropdown from "./SortingDropdown";
import { useLocalStorage } from "react-use";

export enum Sorting {
  ProjectName = "projectName",
  ReposCount = "reposCount",
  ContributorsCount = "contributorsCount",
  MoneyGranted = "moneyGranted",
  LeftToSpend = "leftToSpend",
  TotalBudget = "totalBudget",
}

export const PROJECT_SORTINGS = [
  Sorting.ProjectName,
  Sorting.ReposCount,
  Sorting.ContributorsCount,
  Sorting.MoneyGranted,
  Sorting.LeftToSpend,
  Sorting.TotalBudget,
];

const DEFAULT_SORTING = Sorting.MoneyGranted;

export default function Projects() {
  const { T } = useT();
  const { ledProjectIds } = useAuth();

  const [projectSorting, setProjectSorting] = useLocalStorage("PROJECT_SORTING", DEFAULT_SORTING);
  const [ref] = useScrollRestoration();

  return (
    <ProjectFilterProvider>
      <Background ref={ref} roundedBorders={BackgroundRoundedBorders.Full}>
        <div className="md:container md:mx-auto pt-8 xl:pt-16 pb-8 px-4 md:px-12">
          <div className="relative hidden xl:flex text-5xl font-belwe justify-between items-end">
            {T("navbar.projects")}
            <div className="absolute z-10 right-0 top-0">
              <SortingDropdown
                all={PROJECT_SORTINGS}
                current={projectSorting || DEFAULT_SORTING}
                onChange={setProjectSorting}
              />
            </div>
          </div>
          <div className="flex xl:mt-8 gap-6 h-full">
            <div className="hidden xl:block basis-80 shrink-0 sticky top-0">
              <FilterPanel isProjectLeader={!!ledProjectIds.length} />
            </div>
            <div className="grow min-w-0">
              <Suspense fallback={<Loader />}>
                <AllProjects sorting={projectSorting || DEFAULT_SORTING} />
              </Suspense>
            </div>
          </div>
        </div>
      </Background>
    </ProjectFilterProvider>
  );
}
