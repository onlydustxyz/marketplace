import Card from "src/components//Card";
import RoundedImage from "src/components//RoundedImage";
import PayoutStatus from "src/components/PayoutStatus/PayoutStatus";
import { useIntl } from "src/hooks/useIntl";
import ArrowRightSLine from "src/icons/ArrowRightSLine";
import MoneyDollarCircleLine from "src/icons/MoneyDollarCircleLine";
import TimeLine from "src/icons/TimeLine";
import displayRelativeDate from "src/utils/displayRelativeDate";
import { pretty } from "src/utils/id";
import { MyRewardType } from "./Line";
import { ReactNode, useContext } from "react";
import { ShowMore } from "src/components/Table/ShowMore";
import { components } from "src/__generated/api";
import { AvailableConversion } from "src/components/Currency/AvailableConversion";
import ErrorFallback from "src/ErrorFallback";
import { IMAGES } from "src/assets/img";
import { UserRewardsContext } from "src/_pages/Rewards/context/UserRewards";

export default function MobileUserRewardList({
  onRewardClick,
  emptyState,
}: {
  onRewardClick: (reward: MyRewardType) => void;
  emptyState?: React.ReactElement;
}) {
  const { T } = useIntl();
  const { query, rewards } = useContext(UserRewardsContext);

  const { error, fetchNextPage, hasNextPage, isFetchingNextPage } = query ?? {};

  if (error) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 xl:p-8">
        <ErrorFallback />
      </div>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {rewards.length > 0 ? (
          <>
            {rewards.map(reward => (
              <button onClick={() => onRewardClick(reward)} key={reward.id}>
                <MobileUserRewardItem
                  title={reward?.rewardedOnProjectName}
                  id={reward.id}
                  image={
                    <RoundedImage
                      src={reward?.rewardedOnProjectLogoUrl || IMAGES.logo.space}
                      alt={reward?.rewardedOnProjectName || ""}
                    />
                  }
                  request={T("reward.table.reward", {
                    id: pretty(reward.id),
                    count: reward.numberOfRewardedContributions,
                  })}
                  amount={reward.amount}
                  date={new Date(reward.requestedAt)}
                  payoutStatus={
                    <PayoutStatus
                      {...{
                        id: `payout-status-${reward.id}`,
                        status: reward.status,
                      }}
                    />
                  }
                />
              </button>
            ))}
            {hasNextPage && (
              <div className="py-6">
                <ShowMore onClick={fetchNextPage} loading={isFetchingNextPage} />
              </div>
            )}
          </>
        ) : (
          emptyState ?? null
        )}
      </div>
    </Card>
  );
}

export function MobileUserRewardItem({
  image,
  title,
  id,
  request,
  amount,
  date,
  payoutStatus,
}: {
  image: ReactNode;
  title?: string | null;
  id: string;
  request: string;
  amount: components["schemas"]["RewardAmountResponse"];
  date: Date;
  payoutStatus: ReactNode;
}) {
  const { T } = useIntl();

  return (
    <Card className="flex flex-col gap-3 divide-y divide-greyscale-50/8" selectable>
      <div className="flex flex-col gap-3">
        {payoutStatus}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {image}
            <div className="flex flex-col items-start">
              <div className="font-belwe text-base font-normal">{title}</div>
              <div className="text-sm text-spaceBlue-200">{request}</div>
            </div>
          </div>
          <ArrowRightSLine className="text-xl text-spaceBlue-200" />
        </div>
      </div>

      <div className="flex gap-4 divide-x divide-greyscale-50/8 pt-3 font-walsheim text-sm">
        <div className="flex w-1/2 flex-col items-start">
          <div className="flex items-center gap-1 font-semibold uppercase text-spaceBlue-200">
            <MoneyDollarCircleLine className="text-base font-medium" />
            {T("reward.table.amount")}
          </div>
          <div className="rounded-full border border-white/8 bg-white/2 px-3 py-[6px]">
            <AvailableConversion
              tooltipId={`${id}-contributors-earned-details`}
              totalAmount={amount?.total}
              currency={{
                currency: amount?.currency,
                amount: amount?.total,
                dollar: amount?.dollarsEquivalent,
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-start pl-4 text-left">
          <div className="flex items-center gap-1 font-semibold uppercase text-spaceBlue-200">
            <TimeLine className="text-base font-medium" />
            {T("reward.table.date")}
          </div>
          {displayRelativeDate(date)}
        </div>
      </div>
    </Card>
  );
}
