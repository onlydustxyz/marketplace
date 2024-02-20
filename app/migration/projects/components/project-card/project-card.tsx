import { useMemo } from "react";
import { Link, generatePath } from "react-router-dom";

import { RoutePaths } from "src/App";
import PrivateTag from "src/components/PrivateTag";
import { useIntl } from "src/hooks/useIntl";
import { cn } from "src/utils/cn";

import { Avatar } from "components/ds/avatar/avatar";
import { Card } from "components/ds/card/card";
import { ProjectLeadInvitationBanner } from "components/features/project-lead-invitation-banner/project-lead-invitation-banner";
import { ProjectMissingGithubBanner } from "components/features/project-missing-github-banner/project-missing-github-banner";
import { Flex } from "components/layout/flex/flex";

import { ProjectTags } from "../../features/project-tags/project-tags";
import { ContributorsCounter } from "./contributors-counter/contributors-counter";
import { Ecosystems } from "./ecosystems/ecosystems";
import { Leaders } from "./leaders/leaders";
import { TProjectCard } from "./project-card.types";
import { Summary } from "./summary/summary";
import { Technologies } from "./technologies/technologies";

export function ProjectCard({ project, isFirstHiringProject = false, isUserProjectLead }: TProjectCard.Props) {
  const { T } = useIntl();
  const {
    isInvitedAsProjectLead,
    isMissingGithubAppInstallation,
    visibility,
    name,
    slug,
    logoUrl,
    tags,
    shortDescription,
    leaders,
    contributorCount,
    ecosystems,
    technologies,
  } = project;

  const isErrorVariant = Boolean(isUserProjectLead && isMissingGithubAppInstallation);
  const isPrivate = visibility === "PRIVATE";

  const InviteBanner = useMemo(() => {
    if (isInvitedAsProjectLead) {
      return (
        <ProjectLeadInvitationBanner
          projectName={name}
          on="cards"
          size={"s"}
          btnLabelToken="v2.features.banners.projectLeadInvitation.card.view"
        />
      );
    }

    return null;
  }, [project]);

  const MissingGithubBanner = useMemo(() => {
    if (isUserProjectLead && isMissingGithubAppInstallation) {
      return <ProjectMissingGithubBanner slug={slug} />;
    }

    return null;
  }, [project, isUserProjectLead]);

  return (
    <Link to={generatePath(RoutePaths.ProjectDetails, { projectKey: slug })} className="w-full">
      <Card
        className={cn("relative w-full !pr-0 !pt-0 transition-all hover:scale-[0.998]", {
          "!border-orange-500 bg-orange-900": isErrorVariant,
          "mt-3": isFirstHiringProject,
        })}
        clickable
        border={isInvitedAsProjectLead ? "multiColor" : "light"}
        dataTestId="project-card"
        background="base"
      >
        <Flex direction="row" className="origin-center gap-5">
          <div className="relative hidden flex-shrink-0 pt-4 md:block lg:pt-6">
            <Avatar src={logoUrl} alt={T("v2.pages.projects.highlights.thumbnail")} size="xl" shape="square" />
            {isPrivate && (
              <div className="absolute -bottom-2.5 -right-2.5">
                <PrivateTag />
              </div>
            )}
          </div>
          <Flex direction="col" className="w-full flex-1 gap-1 overflow-hidden pr-4 pt-4 lg:pr-6 lg:pt-6">
            <Flex direction="row" className="mb-4 items-center gap-4 md:mb-0 md:items-start md:gap-2">
              <div className="relative block flex-shrink-0 md:hidden">
                <Avatar
                  src={logoUrl}
                  alt={T("v2.pages.projects.highlights.thumbnail")}
                  size="l"
                  className="h-[68px] w-[68px]"
                  shape="square"
                />
                {isPrivate && (
                  <div className="absolute -bottom-2.5 -right-2.5">
                    <PrivateTag />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-hidden">
                <div className="flex-1 truncate font-belwe text-2xl font-medium">{project.name}</div>
                {tags?.length ? (
                  <Flex direction="row" className="justify-start gap-2 md:hidden">
                    <ProjectTags tags={tags} />
                  </Flex>
                ) : null}
              </div>
              {tags?.length ? (
                <Flex direction="row" className="hidden justify-end gap-2 md:flex">
                  <ProjectTags tags={tags} />
                </Flex>
              ) : null}
            </Flex>
            <Summary shortDescription={shortDescription} />
            <div className="mt-4 flex flex-row flex-wrap items-center gap-4">
              <Leaders leaders={leaders} />
              <ContributorsCounter count={contributorCount} />
              <Ecosystems ecosystems={ecosystems} />
              <Technologies technologies={technologies} />
            </div>
          </Flex>
        </Flex>
        {isInvitedAsProjectLead || isMissingGithubAppInstallation ? (
          <Flex direction="col" className="mt-5 gap-5 pr-4 lg:pr-6">
            {InviteBanner}
            {MissingGithubBanner}
          </Flex>
        ) : null}
      </Card>
    </Link>
  );
}
