import { ProjectDetails } from ".";
import ProjectsSidebar from "./Sidebar";
import Background, { BackgroundRoundedBorders } from "src/components/Background";
import { Outlet } from "react-router-dom";
import ProjectLeadInvitation from "src/components/ProjectLeadInvitation";

interface Props {
  currentProject: ProjectDetails;
  onInvitationAccepted: (invitationId: string) => void;
}

export default function View({ currentProject, onInvitationAccepted }: Props) {
  const outletContext = {
    ...currentProject,
    leads: currentProject.leads,
    projectId: currentProject.id,
    children: currentProject.invitationId && (
      <ProjectLeadInvitation
        projectName={currentProject.name}
        onClick={() => currentProject.invitationId && onInvitationAccepted(currentProject.invitationId)}
      />
    ),
  };
  return (
    <div className="flex flex-1 w-full gap-2 h-full">
      <ProjectsSidebar currentProject={currentProject} />
      <Background roundedBorders={BackgroundRoundedBorders.Right}>
        <div className="h-full px-8 py-6 flex flex-col flex-1 gap-6">
          <Outlet context={outletContext} />
        </div>
      </Background>
    </div>
  );
}
