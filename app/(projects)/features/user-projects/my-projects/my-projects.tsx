import { cn } from "src/utils/cn";

import { Avatar } from "components/ds/avatar/avatar";
import { Card } from "components/ds/card/card";
import { Tooltip } from "components/ds/tooltip/tooltip";
import { BaseLink } from "components/layout/base-link/base-link";
import { Flex } from "components/layout/flex/flex";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";
import { Typography } from "components/layout/typography/typography";

import { NEXT_ROUTER } from "constants/router";

import { AddProjectButton } from "../add-project-button/add-project-button";
import { TMyProjects } from "./my-projects.types";

export function MyProjects({ projects }: TMyProjects.Props) {
  return (
    <Card background="base" hasPadding={false}>
      <Flex direction="col">
        <Flex justifyContent="between" alignItems="center" className="border-b-1 border-card-border-medium px-6 py-4">
          <Typography variant="title-s" translate={{ token: "v2.pages.projects.myProjects.title" }} />

          <AddProjectButton
            buttonProps={{
              size: "xs",
              variant: "secondary",
              children: (
                <>
                  <Icon remixName="ri-add-line" />
                  <Translate token="v2.pages.projects.myProjects.button" />
                </>
              ),
            }}
          />
        </Flex>

        <Flex wrap="wrap" alignItems="center" className="gap-2 px-6 py-4">
          {projects?.map(project => {
            // TODO: @NeoxAzrot add back
            const hasError = false;

            return (
              <Tooltip key={project.id} content={project.name}>
                <BaseLink href={NEXT_ROUTER.projects.details.root(project.slug)}>
                  <Avatar
                    src={project.logoUrl}
                    alt={project.name}
                    size="l"
                    shape="square"
                    className={cn(
                      "border-card-border-light duration-300 ease-in transition-colors hover:border-card-border-heavy",
                      {
                        "border-orange-700 hover:border-orange-500": hasError,
                      }
                    )}
                  />
                </BaseLink>
              </Tooltip>
            );
          })}
        </Flex>
      </Flex>
    </Card>
  );
}
