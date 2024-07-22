"use client";

import { ProjectReactQueryAdapter } from "core/application/react-query-adapter/project";
import { useContext } from "react";

import { HackathonContext } from "app/hackathons/[hackathonSlug]/context/hackathon.context";
import { MainInfo } from "app/hackathons/[hackathonSlug]/features/project-side-overview/components/main-infos/main-info";
import { ProjectCategories } from "app/hackathons/[hackathonSlug]/features/project-side-overview/components/project-categories/project-categories";
import { ProjectInfos } from "app/hackathons/[hackathonSlug]/features/project-side-overview/components/project-infos/project-infos";
import { ProjectLanguages } from "app/hackathons/[hackathonSlug]/features/project-side-overview/components/project-languages/project-languages";
import { TProjectSideOverview } from "app/hackathons/[hackathonSlug]/features/project-side-overview/project-side-overview.types";

import { Paper } from "components/atoms/paper";

import { Header } from "./components/header/header";

export function ProjectSideOverview(_: TProjectSideOverview.Props) {
  const {
    project: { projectId },
  } = useContext(HackathonContext);

  const { data: project } = ProjectReactQueryAdapter.client.useGetProjectById({
    pathParams: { projectId },
    options: {
      enabled: !!projectId,
    },
  });

  if (!project) return null;

  return (
    <Paper size="m" container="2" classNames={{ base: "flex flex-col gap-3" }}>
      <Header slug={project.slug} logoUrl={project.logoUrl} />

      <MainInfo project={project} />
      <ProjectInfos project={project} />
      <div className="grid grid-cols-2 gap-3">
        <ProjectLanguages languages={project.languages} />
        <ProjectCategories categories={project.categories} />
      </div>
    </Paper>
  );
}
