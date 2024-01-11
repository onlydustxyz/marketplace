import TagButton from "src/components/TagButton/TagButton";
import { useIntl } from "src/hooks/useIntl";
import AddLine from "src/icons/AddLine";
import EyeOffLine from "src/icons/EyeOffLine";
import { GithubContributionShortenTypeLabel, GithubContributionType } from "src/types";

import ActionMenu from "../AutoAdd/ActionMenu";

interface ContributionQuickActionsProps {
  remainingCount: number;
  contributionType: GithubContributionType;
  onAutoAdd: (type: GithubContributionType) => void;
  onAutoIgnore: (type: GithubContributionType) => void;
  IconComponent: React.ElementType;
  tooltipLong: string;
  tooltipShort: string;
}

const getShortenTypeLabel = (type: GithubContributionType): string => {
  const typeLabelMap: { [key in GithubContributionType]: string } = {
    [GithubContributionType.Issue]: GithubContributionShortenTypeLabel.Issue,
    [GithubContributionType.PullRequest]: GithubContributionShortenTypeLabel.PullRequest,
    [GithubContributionType.CodeReview]: GithubContributionShortenTypeLabel.CodeReview,
  };

  return typeLabelMap[type] || "";
};

export default function ContributionQuickActions({
  remainingCount,
  contributionType,
  onAutoAdd,
  onAutoIgnore,
  IconComponent,
  tooltipLong,
  tooltipShort,
}: ContributionQuickActionsProps) {
  const { T } = useIntl();
  const shortenTypeLabel = getShortenTypeLabel(contributionType);
  if (remainingCount > 0) {
    return (
      <ActionMenu
        actions={[
          {
            label: T("project.details.rewards.quickActions.add", {
              count: remainingCount,
              type: shortenTypeLabel,
            }),
            onClick: () => onAutoAdd(contributionType),
            icon: <AddLine />,
          },
          {
            label: T("project.details.rewards.quickActions.ignore", {
              count: remainingCount,
              type: shortenTypeLabel,
            }),
            onClick: () => onAutoIgnore(contributionType),
            icon: <EyeOffLine />,
          },
        ]}
      >
        <TagButton as="div">
          <IconComponent className="text-spacePurple-500" />
          <div className="hidden sm:inline">{T(tooltipLong, { count: remainingCount })}</div>
          <div className="visible sm:hidden">{T(tooltipShort, { count: remainingCount })}</div>
        </TagButton>
      </ActionMenu>
    );
  }
  return null;
}
