import { useOutletContext } from "react-router-dom";
import { useStackContribution } from "src/App/Stacks/Stacks";
import { ContributionBadge } from "src/components/Contribution/ContributionBadge";
import { ContributionReview, ReviewStateStatuses } from "src/components/Contribution/ContributionReview";
import { ContributionReward } from "src/components/Contribution/ContributionReward";
import { useAuth } from "src/hooks/useAuth";
import { OutletContext } from "src/pages/ProjectDetails/View";
import { Contribution as ContributionT, GithubContributionType, GithubPullRequestStatus } from "src/types";
import { cn } from "src/utils/cn";

type Props = {
  contribution: ContributionT;
  isMobile?: boolean;
  isMine?: boolean;
};

export function Contribution({ contribution, isMobile = false, isMine = false }: Props) {
  const { githubUserId } = useAuth();

  const outlet = useOutletContext<OutletContext>();
  const { project: outletProject } = outlet ?? {};

  const [openContributionPanel] = useStackContribution();

  const { githubPullRequestReviewState, githubHtmlUrl, githubStatus, githubTitle, id, rewardIds, type } = contribution;

  const project = "project" in contribution ? contribution.project : outletProject;

  function renderReview() {
    if (
      type === GithubContributionType.PullRequest &&
      githubStatus === GithubPullRequestStatus.Open &&
      githubPullRequestReviewState
    ) {
      return <ContributionReview status={ReviewStateStatuses[githubPullRequestReviewState]} />;
    }

    return null;
  }

  return (
    <div
      className={cn("flex w-full gap-2", {
        "flex-col items-start": isMobile,
        "items-center": !isMobile,
      })}
    >
      <div className={cn("flex items-center gap-2 font-walsheim", isMobile ? "w-full" : "min-w-0")}>
        <ContributionBadge contribution={contribution} isMine={isMine} />
        <button
          className="truncate break-all text-left hover:underline"
          onClick={() => {
            if (id && project?.id)
              openContributionPanel({
                contributionId: id,
                projectId: project.id,
                githubHtmlUrl,
              });
          }}
        >
          {githubTitle}
        </button>
      </div>
      <div className="inline-flex items-center gap-1 empty:hidden">
        {rewardIds?.length ? (
          <ContributionReward
            contributionId={id}
            rewardIds={rewardIds}
            projectId={project.id}
            isMine={contribution.githubAuthor.githubUserId === githubUserId}
          />
        ) : null}
        {renderReview()}
      </div>
    </div>
  );
}
