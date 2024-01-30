"use client";

import { Button } from "components/ds/button/button";
import {
  STORAGE_KEY_CREATE_PROJECT_STEP,
  useResetStorage,
} from "src/_pages/ProjectCreation/hooks/useProjectCreationStorage";
import { ProjectCreationSteps } from "src/_pages/ProjectCreation/types/ProjectCreationSteps";
import { cn } from "src/utils/cn";
import { Typography } from "components/layout/typography/typography";
import { Translate } from "components/layout/translate/translate";

export function AddProjectModal({ startProjectCreation }: { startProjectCreation(): void }) {
  const { reset: clearStorage } = useResetStorage();

  const onCancel = () => {
    clearStorage();
    startProjectCreation();
  };

  const onResume = () => {
    const actualStep = localStorage.getItem(STORAGE_KEY_CREATE_PROJECT_STEP);
    if (actualStep !== ProjectCreationSteps.ORGANIZATIONS) {
      localStorage.setItem(STORAGE_KEY_CREATE_PROJECT_STEP, JSON.stringify(ProjectCreationSteps.REPOSITORIES));
    }
    startProjectCreation();
  };

  return (
    <div className={cn("w-60")}>
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <Typography
          variant="title-s"
          className="text-greyscale-50"
          translate={{ token: "project.details.create.startPopOver.title" }}
        />
        <Typography
          variant="body-s"
          className="text-spaceBlue-200"
          translate={{ token: "project.details.create.startPopOver.description" }}
        />
      </div>
      <div className="mt-4 flex flex-row items-stretch gap-2 p-3">
        <Button variant={"secondary"} size="xs" width="full" onClick={onCancel}>
          <Translate token="project.details.create.startPopOver.restart" />
        </Button>
        <Button size="xs" width="full" onClick={onResume}>
          <Translate token="project.details.create.startPopOver.resume" />
        </Button>
      </div>
    </div>
  );
}
