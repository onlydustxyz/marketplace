import Image from "next/image";
import profileCardBackground from "public/images/profile-card-bg.svg";
import { getOrdinalSuffix } from "utils/profile/ordinal-position-suffix";

import { cn } from "src/utils/cn";

import { Avatar } from "components/ds/avatar/avatar";
import { Card } from "components/ds/card/card";
import { Tag } from "components/ds/tag/tag";
import { TProfileCard } from "components/features/profile-card/profile-card.types";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

function ProfileStatItem({ icon, token, count }: TProfileCard.ProfilStatProps) {
  return (
    <div className="flex items-center gap-1">
      <Icon remixName={icon} size={16} />
      <Typography variant="body-m" translate={{ token, params: { count } }} />
    </div>
  );
}

export function ProfileCard(props: TProfileCard.Props) {
  const {
    className,
    avatarUrl,
    login,
    qualifier,
    contributionCount,
    rewardCount,
    contributedProjectCount,
    leadedProjectCount,
    contributorPosition,
    contributorRank,
  } = props;

  return (
    <Card className={cn("relative z-[1] flex w-full flex-col gap-4", className)} background="base" border="multiColor">
      <Image
        src={profileCardBackground}
        alt="profile card background"
        className="absolute inset-0 -z-[1] h-full w-full object-cover object-center opacity-50"
        priority={true}
      />
      <div className="relative z-[1] flex gap-4">
        <Avatar src={avatarUrl} alt={login} size="3xl" />
        <div className="flex w-full flex-col gap-1">
          <div className="flex justify-between gap-2">
            <Typography variant="title-m" className="line-clamp-1">
              {login}
            </Typography>
            <Typography variant="title-m">{getOrdinalSuffix(contributorPosition)}</Typography>
          </div>
          <div className="flex justify-between gap-2">
            <Typography variant="title-s" className="line-clamp-2 text-spaceBlue-100">
              {qualifier}
            </Typography>
            <Typography
              variant="body-s"
              className="whitespace-nowrap text-spaceBlue-100"
              translate={{ token: "v2.features.profileCard.rank", params: { rank: contributorRank } }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <ProfileStatItem
              icon="ri-stack-line"
              token="v2.features.profileCard.counters.contributionCount"
              count={contributionCount}
            />
            <ProfileStatItem
              icon="ri-medal-2-fill"
              token="v2.features.profileCard.counters.rewardCount"
              count={rewardCount}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Tag size="medium">
          <Icon remixName="ri-user-line" size={16} />
          <Translate
            token="v2.features.profileCard.counters.contributedProjectCount"
            params={{ count: contributedProjectCount }}
          />
        </Tag>
        <Tag size="medium">
          <Icon remixName="ri-star-line" size={16} />
          <Translate
            token="v2.features.profileCard.counters.leadedProjectCount"
            params={{ count: leadedProjectCount }}
          />
        </Tag>
      </div>
    </Card>
  );
}