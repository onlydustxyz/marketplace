import { usersApiClient } from "api-client/resources/users";

import { Card } from "components/ds/card/card";
import { PieChart } from "components/features/graphs/pie-chart/pie-chart";
import { Flex } from "components/layout/flex/flex";
import { Typography } from "components/layout/typography/typography";

import { TWorkDistributionGraph } from "./work-distribution-graph.types";

export async function WorkDistributionGraph({ githubUserId }: TWorkDistributionGraph.Props) {
  const stats = await usersApiClient.fetch.getUserPublicStats(githubUserId).request({
    next: { revalidate: 120 },
  });
  const workDistribution = stats?.workDistribution;

  // because it's server we can use translate hook here
  const data = [
    { id: "pull-request", label: "Pull requests", value: workDistribution?.pullRequestCount || 0, color: "#CE66FF" },
    { id: "issues", label: "Issues", value: workDistribution?.issueCount || 0, color: "#FFBC66" },
    { id: "code-reviews", label: "Code reviews", value: workDistribution?.codeReviewCount || 0, color: "#666BD7" },
  ];

  return (
    <Flex direction="col" width="full" className="gap-4">
      <Typography variant="title-m" translate={{ token: "v2.pages.publicProfile.workDistribution.title" }} />

      <Card background={"base"}>
        <PieChart
          data={data}
          pieProps={{
            width: 160,
            height: 160,
          }}
        />
      </Card>
    </Flex>
  );
}
