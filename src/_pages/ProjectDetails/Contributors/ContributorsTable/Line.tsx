import { useMemo } from "react";

import { ProjectContributorItem } from "src/api/Project/queries";
import Button, { ButtonSize, ButtonType } from "src/components/Button";
import Contributor from "src/components/Contributor";
import { AvailableConversion, AvailableConversionCurrency } from "src/components/Currency/AvailableConversion";
import Cell, { CellHeight } from "src/components/Table/Cell";
import Line from "src/components/Table/Line";
import { withTooltip } from "src/components/Tooltip";
import EyeLine from "src/icons/EyeLine";
import EyeOffLine from "src/icons/EyeOffLine";
import SendPlane2Line from "src/icons/SendPlane2Line";
import StackLine from "src/icons/StackLine";
import { RewardDisabledReason } from "src/types";

import { useIntl } from "hooks/translate/use-translate";

type Props<C> = {
  contributor: C;
  isProjectLeader: boolean;
  onRewardGranted: (contributor: C) => void;
  onToggleContributor: (contributor: C) => void;
  rewardDisableReason?: RewardDisabledReason;
};

export default function ContributorLine<C extends ProjectContributorItem>({
  contributor,
  isProjectLeader,
  onRewardGranted,
  onToggleContributor,
  rewardDisableReason,
}: Props<C>) {
  const { T } = useIntl();

  function getDisabledTooltipToken() {
    if (rewardDisableReason === RewardDisabledReason.Budget) {
      return T("contributor.table.noBudgetLeft");
    }

    if (rewardDisableReason === RewardDisabledReason.GithubApp) {
      return T("contributor.table.githubApp");
    }

    return "";
  }

  const currencies: AvailableConversionCurrency[] = useMemo(
    () =>
      (contributor.earned.details || []).map(currency => ({
        currency: currency.currency,
        amount: currency.amount,
        dollar: currency.usdEquivalent,
      })),
    [contributor]
  );

  return (
    <Line key={contributor.login} className="group h-10">
      <Cell height={CellHeight.Small} horizontalMargin={false} className="-ml-px">
        <Contributor contributor={contributor} clickable />
      </Cell>
      <Cell height={CellHeight.Small} horizontalMargin={false}>
        {contributor.contributionCount || "-"}
      </Cell>
      <Cell height={CellHeight.Small} horizontalMargin={false}>
        {contributor.rewardCount || "-"}
      </Cell>
      <Cell height={CellHeight.Small} horizontalMargin={false}>
        {contributor?.earned.totalAmount ? (
          <div className="rounded-full border border-white/8 bg-white/2 px-3 py-[6px]">
            <AvailableConversion
              tooltipId={`${contributor.login}-contributors-earned-details`}
              totalAmount={contributor.earned.totalAmount}
              currencies={currencies}
            />
          </div>
        ) : (
          "-"
        )}
      </Cell>
      {isProjectLeader ? (
        <>
          <Cell height={CellHeight.Small} horizontalMargin={false}>
            {contributor?.contributionToRewardCount && contributor?.contributionToRewardCount > 0 ? (
              <div
                id="to-reward-count"
                className="flex cursor-default items-center gap-1 rounded-full bg-spacePurple-900 px-1.5 py-1 text-spacePurple-400"
                data-tooltip-id="to-reward-details"
                data-tooltip-content={JSON.stringify({
                  unpaidPullRequestCount: contributor.pullRequestToReward,
                  unpaidIssueCount: contributor.issueToReward,
                  unpaidCodeReviewCount: contributor.codeReviewToReward,
                })}
              >
                <StackLine />
                <span className="font-walsheim font-medium">{contributor.contributionToRewardCount}</span>
              </div>
            ) : (
              "-"
            )}
          </Cell>
          <Cell
            height={CellHeight.Small}
            horizontalMargin={false}
            className="invisible flex justify-end gap-2 group-hover:visible"
          >
            <Button
              type={ButtonType.Secondary}
              size={ButtonSize.Sm}
              disabled={Boolean(rewardDisableReason)}
              onClick={() => onRewardGranted(contributor)}
              data-testid="give-reward-button"
              {...withTooltip(getDisabledTooltipToken(), {
                visible: Boolean(rewardDisableReason),
              })}
            >
              <SendPlane2Line />
              {T("project.details.contributors.reward")}
            </Button>
            {isProjectLeader ? (
              <Button
                type={ButtonType.Secondary}
                size={ButtonSize.Sm}
                onClick={() => onToggleContributor(contributor)}
                iconOnly
                data-testid="toggle-contributors-button"
                {...withTooltip(
                  contributor.hidden
                    ? T("project.details.contributors.showContributor.tooltip")
                    : T("project.details.contributors.hideContributor.tooltip")
                )}
              >
                {contributor.hidden ? <EyeLine /> : <EyeOffLine />}
              </Button>
            ) : null}
          </Cell>
        </>
      ) : null}
    </Line>
  );
}
