import { sortBy } from "lodash";
import { FC, useContext, useMemo } from "react";

import { EditContext } from "src/_pages/ProjectDetails/ProjectEdition/EditContext";
import { UseGithubOrganizationsResponse } from "src/api/me/queries";
import { VerticalListItemDrop } from "src/components/New/Cards/VerticalListItemDrop";
import { Flex } from "src/components/New/Layout/Flex";
import InformationLine from "src/icons/InformationLine";
import { getGithubSetupLink } from "src/utils/githubSetupLink";

import { AddMissingRepositories } from "components/features/add-missing-repositories/add-missing-repositories";

import { useIntl } from "hooks/translate/use-translate";

import { Repository } from "./Repository";

export interface OrganizationProps {
  organization: UseGithubOrganizationsResponse;
}
export const Organization: FC<OrganizationProps> = ({ organization }) => {
  const { T } = useIntl();
  const { form } = useContext(EditContext);
  const installedRepos = form?.watch("githubRepos") || [];

  const unInstalledRepo = useMemo(
    () => organization.repos?.filter(repo => !installedRepos.find(installedRepo => installedRepo.id === repo.id)) || [],
    [organization, installedRepos]
  );

  const repositories = useMemo(() => {
    if (unInstalledRepo?.length) {
      return sortBy(unInstalledRepo, "name").map(repo => (
        <Repository key={repo.id} organization={organization} repository={repo} />
      ));
    }

    return (
      <div className="flex flex-row items-center justify-start gap-0.5">
        <InformationLine className="text-base leading-4 text-spaceBlue-200" />
        <p className="text-body-s font-walsheim font-normal text-spaceBlue-200">
          {T("project.details.edit.panel.repositories.noRepositoriesToAdd")}
        </p>
      </div>
    );
  }, [organization, unInstalledRepo]);

  const linkUrl = getGithubSetupLink({
    id: organization.githubUserId,
    login: organization.login,
    installationId: organization.installationId,
    installed: organization.installationStatus === "COMPLETE",
    isAPersonalOrganization: organization.isPersonal,
  });

  return (
    <div className="w-full">
      <VerticalListItemDrop
        ContainerProps={{ className: "bg-transparent" }}
        key={organization.name || organization?.login}
        title={organization?.name || organization?.login || ""}
        avatarAlt={organization?.name || organization?.login || ""}
        avatarSrc={organization?.avatarUrl || ""}
      >
        <Flex justify="start" item="start" className="w-full gap-3" direction="col">
          {repositories}
        </Flex>

        <AddMissingRepositories
          url={linkUrl}
          disabled={!organization.isCurrentUserAdmin}
          tooltip={T("project.details.create.organizations.tooltipInstalledByAdmin")}
          className="mt-3"
        />
      </VerticalListItemDrop>
    </div>
  );
};
