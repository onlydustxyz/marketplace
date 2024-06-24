import { ActivityGraph } from "app/u/[githubLogin]/features/activity-graph/activity-graph";

import { Card } from "components/ds/card/card";
import { Flex } from "components/layout/flex/flex";
import { Typography } from "components/layout/typography/typography";

import { TActivity } from "./activity.types";

export function Activity({ githubId }: TActivity.Props) {
  return (
    <Flex direction="col" className="flex-1 gap-3">
      <Card background={"light"} border={"light"} className={"flex flex-col gap-3"}>
        <Typography
          translate={{ token: "v2.pages.project.details.applicationDetails.profile.stats.activity" }}
          variant="special-label"
          className="text-greyscale-200"
        />
        <ActivityGraph githubUserId={githubId} ecosystems={[]} activityGraphOnly={true} />
      </Card>
    </Flex>
  );
}
