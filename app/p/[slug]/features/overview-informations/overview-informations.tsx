import Image from "next/image";

import { IMAGES } from "src/assets/img";
import MarkdownPreview from "src/components/MarkdownPreview";

import { Card } from "components/ds/card/card";
import { Flex } from "components/layout/flex/flex";
import { Typography } from "components/layout/typography/typography";

import { Tags } from "./components/tags/tags";
import { TOverviewInformations } from "./overview-informations.types";

// TODO: Refacto MarkdownPreview
export function OverviewInformations({ project }: TOverviewInformations.Props) {
  return (
    <Card background="base" hasPadding={false}>
      <Flex direction="col" className="gap-4 px-6 py-4">
        <Flex direction="col" className="gap-2">
          <Flex alignItems="center" className="gap-1 md:gap-4">
            <Image
              alt={project.name}
              src={project?.logoUrl || IMAGES.logo.space}
              loading="lazy"
              objectFit="cover"
              width={80}
              height={80}
              className="h-8 w-8 rounded-lg object-cover object-center md:h-20 md:w-20"
            />

            <Flex direction="col" className="gap-1">
              <Typography variant="title-m">{project.name}</Typography>

              <Tags tags={project.tags} className="hidden lg:flex" />
            </Flex>
          </Flex>

          <Tags tags={project.tags} className="lg:hidden" />
        </Flex>

        <MarkdownPreview className="text-sm">{project.longDescription}</MarkdownPreview>
      </Flex>
    </Card>
  );
}
