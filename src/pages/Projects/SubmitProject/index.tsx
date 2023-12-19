import { useNavigate } from "react-router-dom";
import { RoutePaths } from "src/App";
import Button, { ButtonSize, ButtonType, Width } from "src/components/Button";
import Card from "src/components/Card";
import { useAuth } from "src/hooks/useAuth";
import { useIntl } from "src/hooks/useIntl";
import { SessionMethod, useSessionDispatch } from "src/hooks/useSession";
import { useMemo, useState } from "react";
import ConfirmationPopOver from "src/components/New/Popover/ConfirmationPopover";
import {
  STORAGE_KEY_CREATE_PROJECT_STEP,
  useResetStorage,
} from "src/pages/ProjectCreation/hooks/useProjectCreationStorage";
import { ProjectCreationSteps } from "src/pages/ProjectCreation/types/ProjectCreationSteps";
import {
  GITHUB_PERMISSIONS,
  useLazyGetUserPermissions,
} from "src/hooks/useGithubUserPermissions/useGithubUserPermissions";
import { useLoginUrl, useLoginUrlStorage } from "src/hooks/useLoginUrl/useLoginUrl";
import { cn } from "src/utils/cn";

export default function SubmitProject({ className }: { className?: string }) {
  const { T } = useIntl();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [getPermission] = useLazyGetUserPermissions();
  const [modalOpened, setModalOpened] = useState(false);
  const { reset: clearStorage } = useResetStorage();
  const toggleModal = () => setModalOpened(!modalOpened);
  const closeModal = () => setModalOpened(false);
  const getLoginUrl = useLoginUrl();
  const loginUrlStorage = useLoginUrlStorage();
  const dispatchSession = useSessionDispatch();
  const canResume = useMemo(() => !!localStorage.getItem(STORAGE_KEY_CREATE_PROJECT_STEP), []);

  const onCancel = () => {
    clearStorage();
    startProjectCreation();
  };

  const onClick = () => {
    if (canResume) {
      toggleModal();
    } else {
      clearStorage();
      startProjectCreation();
    }
  };

  const onResume = () => {
    const actualStep = localStorage.getItem(STORAGE_KEY_CREATE_PROJECT_STEP);
    if (actualStep !== ProjectCreationSteps.ORGANIZATIONS) {
      localStorage.setItem(STORAGE_KEY_CREATE_PROJECT_STEP, JSON.stringify(ProjectCreationSteps.REPOSITORIES));
    }
    startProjectCreation();
  };

  const startProjectCreation = async () => {
    const hasRequirePermission = await getPermission(GITHUB_PERMISSIONS.READ_ORG);
    if (isLoggedIn && hasRequirePermission) {
      navigate(RoutePaths.ProjectCreation);
    } else {
      dispatchSession({ method: SessionMethod.SetVisitedPageBeforeLogin, value: RoutePaths.ProjectCreation });
      loginUrlStorage.setValue(`${GITHUB_PERMISSIONS.USER_EMAIL},${GITHUB_PERMISSIONS.READ_ORG}`);
      const login_url = getLoginUrl();
      window.location.replace(login_url);
    }
  };

  return (
    <Card className={cn("mb-4 flex h-fit flex-row gap-4 p-6", className)}>
      <div className="flex-1 text-sm leading-4">{T("project.details.create.description")}</div>
      <div className="relative z-10">
        <ConfirmationPopOver
          onClose={closeModal}
          disabled={!canResume}
          confirm={{
            label: T("project.details.create.startPopOver.resume"),
            onClick: onResume,
          }}
          title={T("project.details.create.startPopOver.title")}
          description={T("project.details.create.startPopOver.description")}
          cancel={{
            label: T("project.details.create.startPopOver.restart"),
            onClick: onCancel,
          }}
        >
          <Button size={ButtonSize.Sm} type={ButtonType.Primary} width={Width.Fit} onClick={onClick}>
            <i className="ri-magic-line" />
            {T("project.details.create.submit.button")}
          </Button>
        </ConfirmationPopOver>
      </div>
    </Card>
  );
}
