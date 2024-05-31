import { ecosystemsApiClient } from "api-client/resources/ecosystems";

import { Slide } from "app/ecosystems/[ecosystemSlug]/features/project-good-first-issues/components/slide/slide";
import { Slider } from "app/ecosystems/[ecosystemSlug]/features/project-good-first-issues/components/slider/slider";

export async function ProjectGoodFirstIssues({ ecosystemSlug }: { ecosystemSlug: string }) {
  const { projects } = await ecosystemsApiClient.fetch
    .getEcosystemProjectBySlug(
      {
        ecosystemSlug,
      },
      {
        pageIndex: 0,
        pageSize: 20,
        // TODO @hayden uncomment to test
        // hasGoodFirstIssues: true,
      }
    )
    .request();

  return (
    <Slider>
      {projects.map(p => (
        <Slide key={p.id} project={p} />
      ))}
    </Slider>
  );
}
