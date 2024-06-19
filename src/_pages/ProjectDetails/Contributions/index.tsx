import { useParams } from "next/navigation";
import { ComponentProps, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import Title from "src/_pages/ProjectDetails/Title";
import ProjectApi from "src/api/Project";
import { ContributionTabContents } from "src/components/Contribution/ContributionTabContents";
import { ContributionTable, TableColumns, type TableSort } from "src/components/Contribution/ContributionTable";
import { Tabs } from "src/components/Tabs/Tabs";
import Flex from "src/components/Utils/Flex";
import { AllTabs, useContributionTabs } from "src/hooks/useContributionTabs";
import { ContributionStatus, OrderBy } from "src/types";
import { getOrgsWithUnauthorizedRepos } from "src/utils/getOrgsWithUnauthorizedRepos";

import { PosthogOnMount } from "components/features/posthog/components/posthog-on-mount/posthog-on-mount";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";

import { useIntl } from "hooks/translate/use-translate";

import { MissingGithubAppInstallBanner } from "../Banners/MissingGithubAppInstallBanner";
import StillFetchingBanner from "../Banners/StillFetchingBanner";
import { EditProjectButton } from "../components/EditProjectButton";
import { RewardProjectButton } from "../components/RewardProjectButton";
import { FilterQueryParams, ProjectContributionsFilter, ProjectContributionsFilterRef } from "./Filter";
import { useContributionTable } from "./useContributionTable";

const initialSort: Record<ContributionStatus, TableSort> = {
  [ContributionStatus.InProgress]: {
    sort: TableColumns.Date,
    direction: OrderBy.Desc,
  },
  [ContributionStatus.Completed]: {
    sort: TableColumns.Date,
    direction: OrderBy.Desc,
  },
  [ContributionStatus.Cancelled]: {
    sort: TableColumns.Date,
    direction: OrderBy.Desc,
  },
};

export default function Contributions() {
  const { T } = useIntl();
  const { slug = "" } = useParams<{ slug?: string }>();

  const { data: project, isLoading: isLoadingProject } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug },
  });

  const orgsWithUnauthorizedRepos = project ? getOrgsWithUnauthorizedRepos(project) : [];
  const hasOrgsWithUnauthorizedRepos = orgsWithUnauthorizedRepos.length > 0;

  const { isActiveTab, updateActiveTab } = useContributionTabs({ defaultTab: AllTabs.Applied });
  const { headerCells, bodyRow } = useContributionTable();

  const [sortStorage, setSortStorage] = useLocalStorage(
    "project-contributions-table-sort-v2-0-0",
    JSON.stringify(initialSort)
  );
  const [sort, setSort] = useState<typeof initialSort>(sortStorage ? JSON.parse(sortStorage) : initialSort);

  const [filterQueryParams, setFilterQueryParams] = useState<FilterQueryParams>();

  const filterRef = useRef<ProjectContributionsFilterRef>(null);

  const tabItems = [
    {
      active: isActiveTab(AllTabs.Applied),
      onClick: () => {
        updateActiveTab(AllTabs.Applied);
      },
      testId: "project-contributions-applied-tab",
      children: (
        <ContributionTabContents>
          <Icon remixName="ri-loader-2-line" />
          <Translate token="contributions.nav.applied" />
        </ContributionTabContents>
      ),
    },
    {
      active: isActiveTab(AllTabs.InProgress),
      onClick: () => {
        updateActiveTab(AllTabs.InProgress);
      },
      testId: "project-contributions-in-progress-tab",
      children: (
        <ContributionTabContents>
          <Icon remixName="ri-progress-4-line" />
          <Translate token="contributions.nav.inProgress" />
        </ContributionTabContents>
      ),
    },
    {
      active: isActiveTab(AllTabs.Completed),
      onClick: () => {
        updateActiveTab(AllTabs.Completed);
      },
      testId: "project-contributions-completed-tab",
      children: (
        <ContributionTabContents>
          <Icon remixName="ri-checkbox-circle-line" />
          <Translate token="contributions.nav.completed" />
        </ContributionTabContents>
      ),
    },
    {
      active: isActiveTab(AllTabs.Cancelled),
      onClick: () => {
        updateActiveTab(AllTabs.Cancelled);
      },
      testId: "project-contributions-canceled-tab",
      children: (
        <ContributionTabContents>
          <Icon remixName="ri-close-circle-line" />
          <Translate token="contributions.nav.canceled" />
        </ContributionTabContents>
      ),
    },
  ];

  // TODO: Change ContributionStatus.InProgress
  const tableItems: Array<ComponentProps<typeof ContributionTable> & { show: boolean }> = [
    {
      id: "applied_contributions_table",
      title: T("contributions.applied.title"),
      description: T("contributions.applied.description"),
      icon: className => <Icon remixName="ri-loader-2-line" className={className} />,
      show: isActiveTab(AllTabs.Applied),
      sort: sort[ContributionStatus.InProgress],
      onSort: sort => {
        setSort(prevState => {
          const state = { ...prevState, [ContributionStatus.InProgress]: sort };

          setSortStorage(JSON.stringify(state));

          return state;
        });
      },
      headerCells,
      bodyRow,
      query: ProjectApi.queries.useProjectContributionsInfiniteList({
        params: {
          projectId: project?.id ?? "",
          queryParams: {
            statuses: ContributionStatus.InProgress,
            ...sort.IN_PROGRESS,
            ...filterQueryParams,
          },
        },
        options: {
          enabled: isActiveTab(AllTabs.Applied) && Boolean(filterQueryParams),
        },
      }),
      filterRef,
    },
    {
      id: "in_progress_contributions_table",
      title: T("contributions.inProgress.title"),
      description: T("contributions.inProgress.description"),
      icon: className => <Icon remixName="ri-progress-4-line" className={className} />,
      show: isActiveTab(AllTabs.InProgress),
      sort: sort[ContributionStatus.InProgress],
      onSort: sort => {
        setSort(prevState => {
          const state = { ...prevState, [ContributionStatus.InProgress]: sort };

          setSortStorage(JSON.stringify(state));

          return state;
        });
      },
      headerCells,
      bodyRow,
      query: ProjectApi.queries.useProjectContributionsInfiniteList({
        params: {
          projectId: project?.id ?? "",
          queryParams: {
            statuses: ContributionStatus.InProgress,
            ...sort.IN_PROGRESS,
            ...filterQueryParams,
          },
        },
        options: {
          enabled: isActiveTab(AllTabs.InProgress) && Boolean(filterQueryParams),
        },
      }),
      filterRef,
    },
    {
      id: "completed_contributions_table",
      title: T("contributions.completed.title"),
      description: T("contributions.completed.description"),
      icon: className => <Icon remixName="ri-checkbox-circle-line" className={className} />,
      sort: sort[ContributionStatus.Completed],
      onSort: sort => {
        setSort(prevState => {
          const state = { ...prevState, [ContributionStatus.Completed]: sort };

          setSortStorage(JSON.stringify(state));

          return state;
        });
      },
      show: isActiveTab(AllTabs.Completed),
      headerCells,
      bodyRow,
      query: ProjectApi.queries.useProjectContributionsInfiniteList({
        params: {
          projectId: project?.id ?? "",
          queryParams: {
            statuses: ContributionStatus.Completed,
            ...sort.COMPLETED,
            ...filterQueryParams,
          },
        },
        options: {
          enabled: isActiveTab(AllTabs.Completed) && Boolean(filterQueryParams),
        },
      }),
      filterRef,
    },
    {
      id: "canceled_contributions_table",
      title: T("contributions.canceled.title"),
      description: T("contributions.canceled.description"),
      icon: className => <Icon remixName="ri-close-circle-line" className={className} />,
      sort: sort[ContributionStatus.Cancelled],
      onSort: sort => {
        setSort(prevState => {
          const state = { ...prevState, [ContributionStatus.Cancelled]: sort };

          setSortStorage(JSON.stringify(state));

          return state;
        });
      },
      show: isActiveTab(AllTabs.Cancelled),
      headerCells,
      bodyRow,
      query: ProjectApi.queries.useProjectContributionsInfiniteList({
        params: {
          projectId: project?.id ?? "",
          queryParams: {
            statuses: ContributionStatus.Cancelled,
            ...sort.CANCELLED,
            ...filterQueryParams,
          },
        },
        options: {
          enabled: isActiveTab(AllTabs.Cancelled) && Boolean(filterQueryParams),
        },
      }),
      filterRef,
    },
  ];

  return (
    <>
      <PosthogOnMount eventName={"project_contributions_list_viewed"} />

      <div className="flex flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-between md:gap-2">
        <Title>{T("project.details.contributions.title")}</Title>
        {!hasOrgsWithUnauthorizedRepos ? (
          <Flex className="w-full justify-start gap-2 md:w-auto md:justify-end">
            <EditProjectButton projectKey={slug} />
            {project && <RewardProjectButton project={project} />}
          </Flex>
        ) : null}
      </div>

      {!project?.indexingComplete && !isLoadingProject ? <StillFetchingBanner /> : null}

      {project && hasOrgsWithUnauthorizedRepos ? (
        <MissingGithubAppInstallBanner slug={project.slug} orgs={orgsWithUnauthorizedRepos} />
      ) : null}

      <div className="h-full overflow-y-auto">
        <div className="h-full w-full overflow-y-auto rounded-3xl bg-contributions bg-right-top bg-no-repeat scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5">
          <div className="relative min-h-full">
            <div className="bg-transparency-gradiant absolute inset-0" />
            <div className="relative z-10">
              <header className="sticky top-0 z-[12] border-b border-card-border-heavy bg-card-background-base px-4 pb-4 pt-7 shadow-heavy md:pb-0 md:pt-8">
                <div className="flex items-center justify-between md:px-4">
                  <Tabs tabs={tabItems} variant="blue" showMobile mobileTitle={T("navbar.contributions")} />

                  <div className="md:-translate-y-3">
                    <ProjectContributionsFilter
                      onChange={filterQueryParams => setFilterQueryParams(filterQueryParams)}
                      ref={filterRef}
                    />
                  </div>
                </div>
              </header>
              <div className="flex flex-col gap-4 px-2 py-3 md:px-3 md:py-6">
                {tableItems.map(({ show, ...restProps }) =>
                  show ? <ContributionTable key={restProps.id} {...restProps} fullTable={false} /> : null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
