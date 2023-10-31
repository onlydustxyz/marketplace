import { useIntl } from "src/hooks/useIntl";

import { pretty } from "src/utils/id";
import { MobileUserRewardItem } from "src/components/UserRewardTable/MobileUserRewardList";
import RoundedImage, { Rounding } from "src/components/RoundedImage";
import { RewardPageItemType } from "src/hooks/useInfiniteRewardsList";
import { PaymentStatus } from "src/types";
import PayoutStatus from "src/components/PayoutStatus/PayoutStatus";
import { AvailableConversion } from "src/components/Currency/AvailableConversion";

export default function MobileRewardList({
  rewards,
  onRewardClick,
  isProjectLeader,
}: {
  rewards: RewardPageItemType[];
  onRewardClick: (reward: RewardPageItemType) => void;
  isProjectLeader: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {rewards.map(reward => (
        <button onClick={() => onRewardClick(reward)} key={reward.id}>
          <MobileRewardItemContainer reward={reward} isProjectLeader={isProjectLeader} />
        </button>
      ))}
    </div>
  );
}

function MobileRewardItemContainer({
  reward,
  isProjectLeader,
}: {
  reward: RewardPageItemType;
  isProjectLeader: boolean;
}) {
  const { T } = useIntl();

  return (
    <MobileUserRewardItem
      image={<RoundedImage src={reward.rewardedUserAvatar} alt={reward.rewardedUserLogin} rounding={Rounding.Circle} />}
      title={reward.rewardedUserLogin}
      request={T("reward.table.reward", {
        id: pretty(reward.id),
        count: reward.numberOfRewardedContributions,
      })}
      //   amount={formatMoneyAmount({ amount: reward.amount.total })}
      amount={
        <div className="mt-2 rounded-full border border-card-border-light bg-card-background-light px-3 py-[6px]">
          <AvailableConversion
            tooltipId={`${reward.id}-reward-conversion`}
            currency={{
              currency: reward.amount.currency,
              amount: reward.amount.total,
              dollar: reward.amount.dollarsEquivalent,
            }}
          />
        </div>
      }
      date={new Date(reward.requestedAt)}
      payoutStatus={<PayoutStatus status={PaymentStatus[reward.status]} isProjectLeaderView={isProjectLeader} />}
    />
  );
}
