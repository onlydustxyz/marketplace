import { useNavigate, useParams } from "react-router-dom";
import ErrorFallback from "src/ErrorFallback";
import Card from "src/components/Card";
import ProjectRewardTableFallback from "src/components/ProjectRewardTableFallback";
import { Fields } from "src/components/RewardTable/Headers";
import RewardTable from "src/components/RewardTable/RewardTable";
import useQueryParamsSorting from "src/components/RewardTable/useQueryParamsSorting";
import Skeleton from "src/components/Skeleton";
import Flex from "src/components/Utils/Flex";
import useInfiniteRewardsList from "src/hooks/useInfiniteRewardsList";
import { useIntl } from "src/hooks/useIntl";
import Title from "src/pages/ProjectDetails/Title";
import { getOrgsWithUnauthorizedRepos } from "src/utils/getOrgsWithUnauthorizedRepos";
import { MissingGithubAppInstallBanner } from "../Banners/MissingGithubAppInstallBanner";
import StillFetchingBanner from "../Banners/StillFetchingBanner";
import { EditProjectButton } from "../components/EditProjectButton";
import { RemainingBudget } from "./RemainingBudget/RemainingBudget";
import ProjectApi from "src/api/Project";
import { RewardProjectButton } from "../components/RewardProjectButton";

const RewardList: React.FC = () => {
  const { T } = useIntl();
  const navigate = useNavigate();
  const { projectKey = "" } = useParams<{ projectKey: string }>();

  const { data: project, isLoading: isLoadingProject } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug: projectKey },
  });

  const { sorting, sortField, queryParams } = useQueryParamsSorting({
    field: Fields.Date,
    isAscending: false,
    storageKey: "projectRewardsSorting",
  });
  const {
    data,
    isLoading: isRewardsLoading,
    fetchNextPage,
    hasNextPage,
    error,
    isFetchingNextPage,
    refetch,
  } = useInfiniteRewardsList({
    projectId: project?.id || "",
    enabled: !!project?.id,
    queryParams,
  });

  const rewards = data?.pages.flatMap(page => page.rewards) || [];
  const orgsWithUnauthorizedRepos = project ? getOrgsWithUnauthorizedRepos(project) : [];
  const hasOrgsWithUnauthorizedRepos = orgsWithUnauthorizedRepos.length > 0;

  if (error) {
    return <ErrorFallback />;
  }

  if (isRewardsLoading || isLoadingProject) {
    return <Skeleton variant="projectRewards" />;
  }

  return project && rewards ? (
    <>
      <div className="flex flex-col items-start justify-start gap-4 md:flex-row md:items-center md:justify-between md:gap-2">
        <Title>{T("project.details.rewards.title")}</Title>
        {!hasOrgsWithUnauthorizedRepos ? (
          <Flex className="w-full justify-start gap-2 md:w-auto md:justify-end">
            <EditProjectButton projectKey={projectKey} />
            <RewardProjectButton project={project} />
          </Flex>
        ) : null}
      </div>
      {!project.indexingComplete ? <StillFetchingBanner /> : null}
      {hasOrgsWithUnauthorizedRepos ? (
        <MissingGithubAppInstallBanner slug={projectKey} orgs={orgsWithUnauthorizedRepos} />
      ) : null}
      {<RemainingBudget projectId={project.id} />}
      <div className="flex h-full flex-col-reverse items-start gap-4 xl:flex-row">
        <div className="w-full">
          {rewards.length > 0 ? (
            <Card>
              <RewardTable
                rewards={rewards}
                options={{
                  fetchNextPage,
                  hasNextPage,
                  sorting,
                  sortField,
                  isFetchingNextPage,
                  refetch,
                }}
                projectId={project.id}
              />
            </Card>
          ) : (
            !isRewardsLoading && (
              <Card className="p-16">
                <ProjectRewardTableFallback project={project} />
              </Card>
            )
          )}
        </div>
      </div>
    </>
  ) : null;
};

export default RewardList;
