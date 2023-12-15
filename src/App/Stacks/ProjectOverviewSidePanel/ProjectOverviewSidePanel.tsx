import ProjectApi from "src/api/Project";
import { ProjectOverviewHeadersCard } from "./components/Header";
import { ProjectOverviewInformations } from "./components/Informations";
import { ProjectOverviewReposCard } from "./components/Repos";
import MarkdownPreview from "src/components/MarkdownPreview";
import SkeletonProjectOverviewPanel from "src/components/Skeleton/SkeletonProjectOverviewPanel";

type Props = {
  slug: string;
};

export const ProjectOverviewSidePanel = ({ slug }: Props) => {
  const { data: project, isLoading } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug },
  });

  // TODO SKELLETON / LOADING

  if (!isLoading) {
    return <SkeletonProjectOverviewPanel />;
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <SkeletonProjectOverviewPanel />
      <div className="h-full overflow-hidden py-8 pr-2 pt-12 lg:pt-0">
        <div className="w-full px-6 pr-4">
          <ProjectOverviewHeadersCard project={project} />
        </div>
        <div className="flex h-full flex-auto flex-col gap-3 overflow-auto p-px pb-6 scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5">
          <div className="flex flex-col gap-4 px-6 pr-4">
            {project.longDescription && (
              <div className="flex flex-col gap-4 rounded-2xl border border-card-border-light  bg-greyscale-900 px-6 py-4 shadow-medium">
                <MarkdownPreview className="text-sm">{project.longDescription}</MarkdownPreview>
              </div>
            )}
            <ProjectOverviewInformations project={project} />
            <ProjectOverviewReposCard project={project} />
          </div>
        </div>
      </div>
    </>
  );
};
