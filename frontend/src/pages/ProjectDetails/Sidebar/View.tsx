import { Listbox } from "@headlessui/react";
import UpDownChevrons from "src/assets/icons/UpDownChevrons";
import { RoutePaths } from "src/App";
import BackLink from "./BackLink";
import RoundedImage, { ImageSize } from "src/components/RoundedImage";
import { ProjectDetails } from "..";
import { useIntl } from "src/hooks/useIntl";
import { ProjectDetailsTab } from ".";
import { generatePath, NavLink, useNavigate } from "react-router-dom";
import classNames from "classnames";
import ProjectOption from "./ProjectOption";
import { ProjectContributorsFragment } from "src/__generated/graphql";

interface Props {
  expandable: boolean;
  currentProject: ProjectDetails;
  allProjects: (SidebarProjectDetails & ProjectContributorsFragment)[];
  availableTabs: ProjectDetailsTab[];
}

export interface SidebarProjectDetails {
  id: string;
  name: string;
  logoUrl: string;
  withInvitation: boolean;
}

export default function View({ expandable, currentProject, allProjects, availableTabs }: Props) {
  const { T } = useIntl();
  const navigate = useNavigate();

  return (
    <div
      className={"flex flex-col shrink-0 w-80 gap-6 bg-noise-medium bg-white/4 p-6 font-walsheim rounded-l-2xl ml-6"}
    >
      <BackLink to={RoutePaths.Projects} className="divide-none">
        {T("project.details.sidebar.backToProjects")}
      </BackLink>
      <div className="flex flex-col gap-6 divide-y divide-neutral-700 w-full">
        <div className="relative h-16">
          <Listbox
            value={currentProject}
            onChange={project =>
              navigate(
                generatePath(RoutePaths.ProjectDetails, {
                  projectId: project.id,
                })
              )
            }
            disabled={!expandable}
          >
            <div className="flex flex-col w-full border-2 rounded-2xl border-neutral-700 divide-y divide-neutral-700 bg-white/2 absolute backdrop-blur-4xl z-10">
              <Listbox.Button className={`p-4 font-medium text-2xl ${expandable ? "hover:cursor-pointer" : ""}`}>
                <div className="flex flex-row gap-3 items-center">
                  <RoundedImage src={currentProject.logoUrl} alt="Project Logo" size={ImageSize.Md} />
                  <div className="truncate grow font-belwe text-left">{currentProject.name}</div>
                  {expandable && <UpDownChevrons className="h-5 w-5 fill-gray-400" />}
                </div>
              </Listbox.Button>
              <Listbox.Options className="flex flex-col divide-y max-h-116 overflow-y-auto rounded-b-2xl scrollbar-thin scrollbar-w-1.5 scrollbar-thumb-white/12 scrollbar-thumb-rounded">
                {allProjects.map(project => (
                  <ProjectOption key={project.id} project={project} isSelected={project.id === currentProject.id} />
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>
        <div className="flex flex-col align-start font-medium text-xl pt-3 pb-2 gap-2">
          {availableTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                classNames("rounded-xl hover:cursor-pointer text-base px-4 py-2.5", {
                  "bg-white/8 text-white": isActive,
                  "text-neutral-400": !isActive,
                })
              }
              data-testid={`${tab.label}-tab`}
              end
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
