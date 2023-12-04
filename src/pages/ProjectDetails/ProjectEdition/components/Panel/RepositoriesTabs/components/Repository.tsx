import { FC, useContext } from "react";
import { Flex } from "src/components/New/Layout/Flex";
import Button, { ButtonSize, ButtonType } from "src/components/Button";
import AddLine from "src/icons/AddLine";
import { useIntl } from "src/hooks/useIntl";
import { EditContext } from "src/pages/ProjectDetails/ProjectEdition/EditContext";
import { UseGithubOrganizationsResponse } from "src/api/me/queries";

export interface RepositoryProps {
  organization: UseGithubOrganizationsResponse;
  repository: UseGithubOrganizationsResponse["repos"][0];
}
export const Repository: FC<RepositoryProps> = ({ organization, repository }) => {
  const { T } = useIntl();
  const { formHelpers } = useContext(EditContext);

  const onClick = () => {
    if (organization.githubUserId && repository.id) {
      formHelpers.addRepository(organization.githubUserId, repository.id);
    }
  };

  return (
    <div className="card-light w-full rounded-large border p-4 shadow-light">
      <Flex justify="start" item="start" className="gap-5">
        <Button iconOnly type={ButtonType.Secondary} size={ButtonSize.Sm} onClick={onClick}>
          <AddLine className="text-base leading-none" />
        </Button>
        <Flex justify="start" item="start" direction="col" className="flex-1 gap-2.5 overflow-hidden">
          <p className="text-body-m-bold">{repository.name}</p>
          <div className="w-full max-w-full">
            <p className="text-body-s w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-greyscale-200">
              {repository.description || T("project.details.overview.repositories.descriptionPlaceholder")}
            </p>
          </div>
        </Flex>
      </Flex>
    </div>
  );
};
