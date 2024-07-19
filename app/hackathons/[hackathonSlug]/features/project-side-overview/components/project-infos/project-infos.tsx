import { useMemo } from "react";

import { InfoDropdown } from "app/hackathons/[hackathonSlug]/components/info-dropdown/info-dropdown";
import { TProjectInfos } from "app/hackathons/[hackathonSlug]/features/project-side-overview/components/project-infos/project-infos.types";

import { Avatar } from "components/atoms/avatar";
import { Paper } from "components/atoms/paper";
import { Tag } from "components/atoms/tag";
import { Typo } from "components/atoms/typo";
import { BaseLink } from "components/layout/base-link/base-link";
import { Translate } from "components/layout/translate/translate";
import { AvatarGroup } from "components/molecules/avatar-group";

function Sponsors({ sponsors }: { sponsors: TProjectInfos.Sponsor[] }) {
  if (sponsors.length > 2) {
    return (
      <InfoDropdown
        targetLabel={
          <Translate token={"v2.features.projectSideOverview.countSponsors"} params={{ count: sponsors.length }} />
        }
        dropdownTitleToken={"v2.features.projectSideOverview.sponsors"}
        links={sponsors}
      />
    );
  }

  return (
    <div className={"flex flex-wrap gap-2"}>
      {sponsors.map(s => (
        <Tag
          key={s.id}
          as={s.url ? BaseLink : "span"}
          htmlProps={{ href: s.url ?? "" }}
          avatar={{ src: s.logoUrl, alt: s.name }}
          style={"outline"}
          color={"white"}
          size={"s"}
        >
          {s.name}
        </Tag>
      ))}
    </div>
  );
}

export function ProjectInfos({ project }: TProjectInfos.Props) {
  const renderLeaders = useMemo(() => {
    if (project?.leaders?.length) {
      if (project?.leaders?.length === 1) {
        return (
          <div className={"grid gap-1"}>
            <Typo size={"xs"} color={"text-2"} translate={{ token: "v2.features.projectSideOverview.projectLeads" }} />
            <div className="flex items-center gap-1">
              <Avatar shape="round" size="s" src={project?.leaders[0].avatarUrl} />
              <Typo size={"xs"} color={"text-1"}>
                {project?.leaders[0].login}
              </Typo>
            </div>
          </div>
        );
      }
      return (
        <div className={"grid gap-1"}>
          <Typo size={"xs"} color={"text-2"} translate={{ token: "v2.features.projectSideOverview.projectLeads" }} />
          <AvatarGroup
            avatars={project?.leaders.map(({ avatarUrl }) => ({ src: avatarUrl }))}
            size="s"
            maxAvatars={2}
          />
        </div>
      );
    }
    return null;
  }, [project?.leaders]);

  const renderContributors = useMemo(() => {
    if (project?.topContributors?.length) {
      if (project?.topContributors?.length === 1) {
        return (
          <div className={"grid gap-1"}>
            <Typo size={"xs"} color={"text-2"} translate={{ token: "v2.features.projectSideOverview.contributors" }} />
            <div className="flex items-center gap-1">
              <Avatar shape="round" size="s" src={project?.topContributors[0].avatarUrl} />
              <Typo size={"xs"} color={"text-1"}>
                {project?.topContributors[0].login}
              </Typo>
            </div>
          </div>
        );
      }
      return (
        <div className={"grid gap-1"}>
          <Typo size={"xs"} color={"text-2"} translate={{ token: "v2.features.projectSideOverview.contributors" }} />
          <AvatarGroup
            avatars={project?.topContributors.map(({ avatarUrl }) => ({ src: avatarUrl }))}
            size="s"
            maxAvatars={2}
          />
        </div>
      );
    }
    return null;
  }, [project?.topContributors]);

  return (
    <Paper size={"m"} container={"2"} classNames={{ base: "grid gap-3" }}>
      <div className={"flex flex-wrap gap-4"}>
        {renderLeaders}
        {renderContributors}
        {project?.sponsors?.length ? (
          <div className={"grid gap-1"}>
            <Typo size={"xs"} color={"text-2"} translate={{ token: "v2.features.projectSideOverview.sponsors" }} />
            <Sponsors sponsors={project?.sponsors} />
          </div>
        ) : null}
      </div>
    </Paper>
  );
}
