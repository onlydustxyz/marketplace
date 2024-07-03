import { THackathonSection } from "app/hackathons/features/hackathon-section/hackathon-section.types";

import { SkeletonEl } from "components/ds/skeleton/skeleton";
import { HackathonCard } from "components/features/hackathons/hackathon-card/hackathon-card";
import { getHackathonBackground } from "components/features/hackathons/hackathon-card/hackathon-card.utils";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

export function HackathonSection({ title, icon, items, status }: THackathonSection.Props) {
  if (!items.length) return null;

  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <div className="flex w-full flex-row items-center justify-start gap-2">
        <Icon {...icon} />
        <Typography variant="title-m">{title}</Typography>
      </div>
      <div className="flex w-full flex-col items-start justify-start gap-8">
        {items.map(item => (
          <HackathonCard
            classNames={{ base: "w-full" }}
            key={item.slug}
            title={item.title}
            slug={item.slug}
            backgroundImage={getHackathonBackground(item.index)}
            location={<Translate token={"v2.pages.hackathons.defaultLocation"} />}
            startDate={new Date(item.startDate)}
            endDate={new Date(item.endDate)}
            status={status}
            projects={item.projects}
          />
        ))}
      </div>
    </div>
  );
}

export function HackathonSectionLoading() {
  return (
    <div className="flex w-full flex-col items-start justify-start gap-4">
      <SkeletonEl width="120px" height="32px" variant="rounded" />
      <div className="flex w-full flex-col items-start justify-start gap-8">
        <SkeletonEl width="100%" height="300px" variant="rounded" />
      </div>
    </div>
  );
}
