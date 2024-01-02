import { Flex } from "components/layout/flex/flex";
import ProjectCard from "./components/project-card/project-card.tsx";
import Projects from "./_temp-mock.ts";
import { Filters } from "./components/filters/filters.tsx";

function ProjectsPage() {
  return (
    <Flex direction="col">
      <Flex>
        <div className="sticky top-0 z-10 hidden shrink-0 basis-80 xl:block">
          <Filters />
        </div>

        <Flex direction="col" className="min-w-0 grow gap-5">
          {Projects.map((project, index) => {
            const isFirstHiringProject = index === 0 && project.hiring;
            return <ProjectCard key={index} project={project} isFirstHiringProject={isFirstHiringProject} />;
          })}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ProjectsPage;
