import { ComponentProps } from "react";

import { ContributionIcon } from "src/components/Contribution/ContributionIcon";
import Tooltip, { TooltipPosition, Variant } from "src/components/Tooltip";
import Time from "src/icons/TimeLine";
import { GithubCodeReviewStatus, GithubContributionType, GithubIssueStatus, GithubPullRequestStatus } from "src/types";
import { cn } from "src/utils/cn";
import { getFormattedDateGB, getFormattedTimeUS } from "src/utils/date";
import displayRelativeDate from "src/utils/displayRelativeDate";

import { useIntl } from "hooks/translate/use-translate";

const creationTokens = {
  [GithubContributionType.PullRequest]: "contributions.tooltip.dateOpened",
  [GithubContributionType.Issue]: "contributions.tooltip.dateAssigned",
  [GithubContributionType.CodeReview]: "contributions.tooltip.dateAssigned",
};

export const iconsStatus = {
  [GithubContributionType.PullRequest]: GithubPullRequestStatus.Open,
  [GithubContributionType.Issue]: GithubIssueStatus.Open,
  [GithubContributionType.CodeReview]: GithubCodeReviewStatus.Pending,
};

type ContributionCreationDateProps = {
  id: string;
  type: GithubContributionType;
  date: Date;
  tooltipProps?: ComponentProps<typeof Tooltip>;
};

export function ContributionCreationDate({
  id,
  type,
  date,
  tooltipProps = {
    position: TooltipPosition.Bottom,
    variant: Variant.Blue,
  },
}: ContributionCreationDateProps) {
  const { T } = useIntl();

  const tooltipId = `${id}-created-at-tooltip`;
  const { className, ...rest } = tooltipProps;
  const creationDateShort = displayRelativeDate(date);

  const creationDate = T(creationTokens[type], {
    date: getFormattedDateGB(date),
    time: getFormattedTimeUS(date),
  });

  return (
    <>
      <Tooltip id={tooltipId} clickable position={TooltipPosition.Bottom} {...rest}>
        <div className={cn("flex items-center gap-2", className)}>
          <ContributionIcon type={type} status={iconsStatus[type]} />
          <p>{creationDate}</p>
        </div>
      </Tooltip>

      <div data-tooltip-id={tooltipId} className="flex items-center gap-1 first-letter:uppercase">
        <Time />
        {creationDateShort}
      </div>
    </>
  );
}
